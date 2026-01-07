
"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom Icons
const truckIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [30, 48],
    iconAnchor: [15, 48],
    popupAnchor: [1, -40],
    shadowSize: [48, 48]
});

const issueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const binIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [1, -30],
    shadowSize: [32, 32]
});

const taskIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Routing Component
const RoutingControl = ({ start, end }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map || !start || !end) return;

        // Cleanup previous routing control
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        routingControlRef.current = L.Routing.control({
            waypoints: [
                L.latLng(start[0], start[1]),
                L.latLng(end[0], end[1])
            ],
            lineOptions: {
                styles: [{ color: '#3b82f6', weight: 6, opacity: 0.8 }]
            },
            show: false,
            addWaypoints: false,
            routeWhileDragging: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            createMarker: () => null // We use our own markers
        }).addTo(map);

        return () => {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [map, start, end]);

    return null;
};

// Mock Initial Positions (Algiers)
const INITIAL_TRUCKS = [
    { id: 101, lat: 36.7525, lng: 3.0420, name: "Truck #101", status: "Moving" },
    { id: 102, lat: 36.7325, lng: 3.0820, name: "Truck #102", status: "Collecting" },
    { id: 103, lat: 36.7600, lng: 3.0600, name: "Truck #103", status: "Idle" },
];

const ISSUES = [
    { id: 1, lat: 36.7550, lng: 3.0550, type: "Overflowing Bin", reported: "10 mins ago" },
    { id: 2, lat: 36.7400, lng: 3.0300, type: "Illegal Dumping", reported: "1 hour ago" },
];

export default function AdminMap({ bins = [], tasks = [] }) {
    const [trucks, setTrucks] = useState(INITIAL_TRUCKS);
    const [activeRouteEnd, setActiveRouteEnd] = useState(null);
    const collectorPos = trucks[0] ? [trucks[0].lat, trucks[0].lng] : [36.7528, 3.0420];

    // Simulate movement
    useEffect(() => {
        console.log("AdminMap Rendering. Bins:", bins.length, "Tasks:", tasks.length);
        const interval = setInterval(() => {
            setTrucks(currentTrucks =>
                currentTrucks.map(truck => ({
                    ...truck,
                    lat: truck.lat + (Math.random() - 0.5) * 0.0002, // Slower movement
                    lng: truck.lng + (Math.random() - 0.5) * 0.0002
                }))
            );
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden rounded-[3rem]">
            <MapContainer
                center={[36.7528, 3.0420]}
                zoom={13}
                style={{ height: "100%", width: "100%", background: "#0f172a" }}
                zoomControl={false}
            >
                {/* Standard Free OpenStreetMap Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {activeRouteEnd && (
                    <RoutingControl start={collectorPos} end={activeRouteEnd} />
                )}

                {/* Trucks */}
                {trucks.map(truck => (
                    <Marker key={truck.id} position={[truck.lat, truck.lng]} icon={truckIcon}>
                        <Popup className="premium-popup">
                            <div className="p-3 min-w-[150px] bg-slate-900 text-white rounded-xl">
                                <h3 className="font-black text-lg border-b border-white/10 pb-2 mb-2">{truck.name}</h3>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Current Status</span>
                                    <span className="font-black text-emerald-400 uppercase tracking-widest">{truck.status}</span>
                                </div>
                                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    Live Geospatial Signal
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Issues */}
                {ISSUES.map(issue => (
                    <Marker key={issue.id} position={[issue.lat, issue.lng]} icon={issueIcon}>
                        <Popup>
                            <div className="p-2 min-w-[180px]">
                                <h3 className="font-black text-red-500 text-sm mb-1 uppercase tracking-wider">Alert: {issue.type}</h3>
                                <p className="text-xs text-slate-500 font-bold">Reported {issue.reported}</p>
                                <button
                                    onClick={() => setActiveRouteEnd([issue.lat, issue.lng])}
                                    className="mt-3 w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Calculate Rapid Path
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Real Bins from DB */}
                {bins.map(bin => {
                    const isFull = bin.fillLevel > 80;
                    const binColor = isFull ? 'red' : bin.fillLevel > 50 ? 'orange' : 'green';

                    const customBinIcon = new L.Icon({
                        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${binColor}.png`,
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });

                    return (
                        bin.latitude && bin.longitude && (
                            <Marker key={bin.id} position={[bin.latitude, bin.longitude]} icon={customBinIcon}>
                                <Popup>
                                    <div className="p-4 min-w-[200px] bg-slate-900 text-white rounded-2xl border border-white/10 shadow-2xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-black text-sm uppercase tracking-tight">{bin.location}</h3>
                                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`}>
                                                {isFull ? 'Critical' : 'Stable'}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Intelligence Level</span>
                                                    <span className={`text-xs font-black ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>{bin.fillLevel}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${bin.fillLevel}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest pt-2 border-t border-white/5">
                                                <div>Type: {bin.type}</div>
                                                <div className="text-right">ID: {bin.id.slice(-4)}</div>
                                            </div>
                                            <button
                                                onClick={() => setActiveRouteEnd([bin.latitude, bin.longitude])}
                                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                            >
                                                Optimize Intercept
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    );
                })}

                {/* Real Tasks from DB */}
                {tasks.map(task => (
                    task.latitude && task.longitude && (
                        <Marker key={task.id} position={[task.latitude, task.longitude]} icon={taskIcon}>
                            <Popup>
                                <div className="p-3 min-w-[180px]">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Mission Target</h3>
                                    </div>
                                    <p className="text-sm font-black text-slate-800 leading-tight mb-2">{task.address}</p>
                                    <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase mb-4">
                                        <span>{task.type}</span>
                                        <span>{task.bins} Bins</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setActiveRouteEnd([task.latitude, task.longitude])}
                                            className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Pathfind
                                        </button>
                                        {activeRouteEnd && activeRouteEnd[0] === task.latitude && (
                                            <button
                                                onClick={() => setActiveRouteEnd(null)}
                                                className="px-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-all font-black"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>

            {/* Custom UI Overlays */}
            <div className="absolute bottom-8 left-8 z-[1000] flex flex-col gap-3">
                <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[200px]">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Live Intelligence</p>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400 font-bold">Network Load</span>
                            <span className="text-xs text-white font-black">Normal</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400 font-bold">Satellites</span>
                            <span className="text-xs text-white font-black">09 Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {activeRouteEnd && (
                <div className="absolute top-8 right-8 z-[1000] animate-in slide-in-from-right-8 duration-500">
                    <button
                        onClick={() => setActiveRouteEnd(null)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-red-600/30 flex items-center gap-2"
                    >
                        <span>Clear Optimized Route</span>
                    </button>
                </div>
            )}
        </div>
    );
}
