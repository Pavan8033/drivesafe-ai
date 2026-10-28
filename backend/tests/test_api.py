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


def test_websocket_malformed_json_resilience():
    """Verify that sending non-JSON or invalid syntax does not crash the WebSocket."""
    with client.websocket_connect("/ws/monitor") as websocket:
        websocket.send_text("THIS_IS_NOT_VALID_JSON{{{")
        # Should stay alive and respond to valid ping
        websocket.send_text(json.dumps({"action": "ping"}))
        data = websocket.receive_json()
        assert data["type"] == "pong"


def test_websocket_corrupted_frame_handling():
    """Verify that corrupted base64 frames return UNKNOWN telemetry safely without error."""
    with client.websocket_connect("/ws/monitor") as websocket:
        websocket.send_text(json.dumps({"action": "frame", "frame": "corrupted_non_image_base64_data"}))
        data = websocket.receive_json()
        assert data["status"] == "UNKNOWN"
        assert data["face_detected"] is False


def test_websocket_oversized_payload_rejection():
    """Verify that payloads exceeding 5MB are safely rejected without crashing."""
    with client.websocket_connect("/ws/monitor") as websocket:
        huge_frame = "A" * (6 * 1024 * 1024)  # 6 MB
        websocket.send_text(json.dumps({"action": "frame", "frame": huge_frame}))
        # Socket should remain responsive
        websocket.send_text(json.dumps({"action": "ping"}))
        data = websocket.receive_json()
        assert data["type"] == "pong"

