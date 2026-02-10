from xarm import XArmAPI
import asyncio
import websockets
import json

# conecta no robô
# arm = XArmAPI('192.168.1.153')
# arm.motion_enable(True)
# arm.set_mode(0)
# arm.set_state(0)

print("🤖 Conectado ao Lite 6")


async def handler(websocket):
    async for message in websocket:
        data = json.loads(message)

        print(data)
        if data.get("action") == "stop":
            # arm.set_state(4)
            continue

        # arm.set_state(0)

        # arm.set_servo_angle(
        #     angle=[
        #         data["j1"],
        #         data["j2"],
        #         data["j3"],
        #         data["j4"],
        #         data["j5"],
        #         data["j6"],
        #     ],
        #     speed=100,
        #     mvacc=1000,
        #     wait=False
        # )


async def main():
    async with websockets.serve(handler, "0.0.0.0", 9001):
        print("🚀 Servidor Python aguardando comandos...")
        await asyncio.Future()

asyncio.run(main())
