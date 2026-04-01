"""
Haptic feedback service — extension point.

This module is a stub for future haptic output integration.
It follows the same service pattern as gesture/neural so it
can be wired into the modality system when hardware is ready.
"""


class HapticsService:
    """Placeholder for haptic feedback integration."""

    def __init__(self) -> None:
        self.active = False
        self.devices: list[str] = []

    def trigger_pattern(self, pattern_id: str, intensity: float = 1.0) -> bool:
        """
        Send a haptic pattern to connected devices.

        Args:
            pattern_id: Identifier of the vibration pattern.
            intensity: 0.0–1.0 amplitude multiplier.

        Returns:
            True if sent successfully.
        """
        # TODO: Implement Web Bluetooth / USB HID communication
        return False

    def scan_devices(self) -> list[str]:
        """Scan for available haptic peripherals."""
        # TODO: Implement device discovery
        self.devices = []
        return self.devices


haptics_service = HapticsService()
