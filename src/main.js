// アプリケーションの状態
let state = {
    isTracking: false,
    trackingStartTime: null,
    currentRoute: [],
    points: [],
    map: null,
    routeLayer: null,
    markersLayer: null,
    watchId: null,
    totalDistance: 0
};

// LocalStorageキー
const STORAGE_KEY = 'travel-route-data';

// アプリ初期化
function initApp() {
    // 地図の初期化
    state.map = L.map('map').setView([35.6762, 139.6503], 13); // 東京を初期位置に

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(state.map);

    state.routeLayer = L.layerGroup().addTo(state.map);
    state.markersLayer = L.layerGroup().addTo(state.map);

    // 保存されたデータを読み込み
    loadData();

    // 現在地を取得して地図を移動
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                state.map.setView([latitude, longitude], 15);

                // 現在地マーカーを追加
                L.marker([latitude, longitude], {
                    icon: L.divIcon({
                        className: 'current-location',
                        html: '📍',
                        iconSize: [30, 30]
                    })
                }).addTo(state.map);
            },
            (error) => {
                console.error('位置情報の取得に失敗:', error);
                alert('位置情報の取得に失敗しました。設定を確認してください。');
            }
        );
    }

    // イベントリスナーの設定
    setupEventListeners();

    // 既存のルートと地点を表示
    renderRoute();
    renderMarkers();
    updateStats();
}

// イベントリスナーの設定
function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', startTracking);
    document.getElementById('stopBtn').addEventListener('click', stopTracking);
    document.getElementById('addPointBtn').addEventListener('click', showAddPointModal);
    document.getElementById('statsBtn').addEventListener('click', toggleStats);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('closeStats').addEventListener('click', toggleStats);
    document.getElementById('savePoint').addEventListener('click', savePoint);
    document.getElementById('cancelPoint').addEventListener('click', hideAddPointModal);
}

// 記録開始
function startTracking() {
    if (!navigator.geolocation) {
        alert('お使いのブラウザは位置情報に対応していません。');
        return;
    }

    state.isTracking = true;
    state.trackingStartTime = Date.now();
    state.currentRoute = [];

    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    state.watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const point = { lat: latitude, lng: longitude, timestamp: Date.now() };

            state.currentRoute.push(point);

            // 距離を計算
            if (state.currentRoute.length > 1) {
                const lastPoint = state.currentRoute[state.currentRoute.length - 2];
                const distance = calculateDistance(lastPoint.lat, lastPoint.lng, latitude, longitude);
                state.totalDistance += distance;
            }

            renderRoute();
            updateStats();
            saveData();
        },
        (error) => {
            console.error('位置情報の取得エラー:', error);
        },
        options
    );

    updateUI();
}

// 記録停止
function stopTracking() {
    if (state.watchId) {
        navigator.geolocation.clearWatch(state.watchId);
        state.watchId = null;
    }

    state.isTracking = false;
    state.trackingStartTime = null;

    updateUI();
    saveData();
}

// ルートを地図に描画
function renderRoute() {
    state.routeLayer.clearLayers();

    if (state.currentRoute.length > 1) {
        const latlngs = state.currentRoute.map(p => [p.lat, p.lng]);
        L.polyline(latlngs, {
            color: '#667eea',
            weight: 4,
            opacity: 0.7
        }).addTo(state.routeLayer);

        // 最新の位置にパン
        const lastPoint = state.currentRoute[state.currentRoute.length - 1];
        state.map.panTo([lastPoint.lat, lastPoint.lng]);
    }
}

// マーカーを地図に描画
function renderMarkers() {
    state.markersLayer.clearLayers();

    state.points.forEach((point, index) => {
        const marker = L.marker([point.lat, point.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: `<div style="background: #2196F3; color: white; padding: 8px 12px; border-radius: 20px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${index + 1}</div>`,
                iconSize: [40, 40]
            })
        });

        marker.bindPopup(`
            <b>${point.name}</b><br>
            ${point.memo ? point.memo + '<br>' : ''}
            <small>${new Date(point.timestamp).toLocaleString('ja-JP')}</small>
        `);

        marker.addTo(state.markersLayer);
    });
}

// 統計情報の更新
function updateStats() {
    // 総移動距離
    document.getElementById('totalDistance').textContent =
        (state.totalDistance / 1000).toFixed(2) + ' km';

    // 記録時間
    let totalMinutes = 0;
    if (state.trackingStartTime) {
        totalMinutes = Math.floor((Date.now() - state.trackingStartTime) / 60000);
    } else if (state.currentRoute.length > 0) {
        const first = state.currentRoute[0].timestamp;
        const last = state.currentRoute[state.currentRoute.length - 1].timestamp;
        totalMinutes = Math.floor((last - first) / 60000);
    }
    document.getElementById('totalTime').textContent = totalMinutes + '分';

    // 訪問地点数
    document.getElementById('pointCount').textContent = state.points.length;

    // 平均速度
    const avgSpeed = totalMinutes > 0 ?
        ((state.totalDistance / 1000) / (totalMinutes / 60)).toFixed(1) : 0;
    document.getElementById('avgSpeed').textContent = avgSpeed + ' km/h';

    // 地点リストの表示
    const pointsList = document.getElementById('pointsList');
    const listHTML = state.points.map((point, index) => `
        <div class="point-item">
            <div>
                <strong>${index + 1}. ${point.name}</strong><br>
                <small>${new Date(point.timestamp).toLocaleString('ja-JP')}</small>
            </div>
        </div>
    `).join('');

    if (state.points.length > 0) {
        pointsList.innerHTML = '<h3>訪問地点</h3>' + listHTML;
    } else {
        pointsList.innerHTML = '<h3>訪問地点</h3><p style="color: #999;">まだ地点が登録されていません</p>';
    }
}

// UIの更新
function updateUI() {
    const status = document.getElementById('status');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');

    if (state.isTracking) {
        status.textContent = '記録中';
        status.classList.remove('inactive');
        startBtn.disabled = true;
        stopBtn.disabled = false;
    } else {
        status.textContent = '停止中';
        status.classList.add('inactive');
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
}

// 地点追加モーダルを表示
function showAddPointModal() {
    if (!navigator.geolocation) {
        alert('位置情報が利用できません。');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            state.tempLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            document.getElementById('addPointModal').classList.add('show');
        },
        (error) => {
            alert('現在地の取得に失敗しました。');
            console.error(error);
        }
    );
}

// 地点追加モーダルを非表示
function hideAddPointModal() {
    document.getElementById('addPointModal').classList.remove('show');
    document.getElementById('pointName').value = '';
    document.getElementById('pointMemo').value = '';
}

// 地点を保存
function savePoint() {
    const name = document.getElementById('pointName').value.trim();

    if (!name) {
        alert('地点名を入力してください。');
        return;
    }

    const memo = document.getElementById('pointMemo').value.trim();

    const point = {
        name,
        memo,
        lat: state.tempLocation.lat,
        lng: state.tempLocation.lng,
        timestamp: Date.now()
    };

    state.points.push(point);

    renderMarkers();
    updateStats();
    saveData();
    hideAddPointModal();
}

// 統計パネルの表示切替
function toggleStats() {
    const panel = document.getElementById('statsPanel');
    panel.classList.toggle('show');
}

// データをLocalStorageに保存
function saveData() {
    const data = {
        currentRoute: state.currentRoute,
        points: state.points,
        totalDistance: state.totalDistance
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// データをLocalStorageから読み込み
function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            state.currentRoute = data.currentRoute || [];
            state.points = data.points || [];
            state.totalDistance = data.totalDistance || 0;
        } catch (e) {
            console.error('データの読み込みに失敗:', e);
        }
    }
}

// データをエクスポート
function exportData() {
    if (state.currentRoute.length === 0 && state.points.length === 0) {
        alert('エクスポートするデータがありません。');
        return;
    }

    // GPX形式でエクスポート
    let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Travel Route Tracker">
  <metadata>
    <name>旅行ルート</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>移動ルート</name>
    <trkseg>
`;

    state.currentRoute.forEach(point => {
        gpx += `      <trkpt lat="${point.lat}" lon="${point.lng}">
        <time>${new Date(point.timestamp).toISOString()}</time>
      </trkpt>
`;
    });

    gpx += `    </trkseg>
  </trk>
`;

    state.points.forEach(point => {
        gpx += `  <wpt lat="${point.lat}" lon="${point.lng}">
    <name>${escapeXml(point.name)}</name>
    <desc>${escapeXml(point.memo || '')}</desc>
    <time>${new Date(point.timestamp).toISOString()}</time>
  </wpt>
`;
    });

    gpx += '</gpx>';

    // ファイルをダウンロード
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel-route-${new Date().toISOString().split('T')[0]}.gpx`;
    a.click();
    URL.revokeObjectURL(url);

    alert('ルートデータをエクスポートしました。');
}

// XML特殊文字のエスケープ
function escapeXml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// 2地点間の距離を計算（メートル）
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 地球の半径（メートル）
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Service Workerの登録
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

// アプリ起動
initApp();
