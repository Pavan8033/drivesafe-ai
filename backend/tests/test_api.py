"""Integration tests for FastAPI endpoints and WebSocket."""

import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "DriveSafe AI Telemetry Engine"
    assert "endpoints" in data


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "model_loaded" in data
    assert data["version"] == "1.0.0"


def test_monitoring_config_endpoint():
    response = client.get("/api/monitoring/config")
    assert response.status_code == 200
    config = response.json()
    assert config["ear_threshold"] > 0
    assert config["prolonged_closure_seconds"] > 0
    assert config["mar_threshold"] > 0


def test_websocket_ping_and_session():
    with client.websocket_connect("/ws/monitor") as websocket:
        # Test Ping -> Pong
        websocket.send_text(json.dumps({"action": "ping"}))
        data = websocket.receive_json()
        assert data["type"] == "pong"

        # Test Start Session
        websocket.send_text(
            json.dumps({"action": "start", "session_id": "test-ws-session"})
        )
        data = websocket.receive_json()
        assert data["type"] == "session_started"
        assert data["session_id"] == "test-ws-session"

        # Test Stop Session -> Summary
        websocket.send_text(json.dumps({"action": "stop"}))
        data = websocket.receive_json()
        assert data["type"] == "session_summary"
        summary = data["summary"]
        assert summary["session_id"] == "test-ws-session"
        assert summary["session_status"] == "COMPLETED"
