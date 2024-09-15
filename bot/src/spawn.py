import os
import requests
import time
import logging

FLY_API_HOST = os.getenv("FLY_API_HOST", "https://api.machines.dev/v1")
FLY_APP_NAME = os.getenv("FLY_APP_NAME")
FLY_API_KEY = os.getenv("FLY_API_KEY")
FLY_HEADERS = {
    "Authorization": f"Bearer {FLY_API_KEY}",
    "Content-Type": "application/json",
}

MAX_RETRIES = 10
RETRY_DELAY = 5


def spawn_fly_machine(room_url: str, token: str):
    # Use the same image as the bot runner
    res = requests.get(
        f"{FLY_API_HOST}/apps/{FLY_APP_NAME}/machines", headers=FLY_HEADERS
    )
    if res.status_code != 200:
        raise Exception(f"Unable to get machine info from Fly: {res.text}")
    image = res.json()[0]["config"]["image"]

    # Machine configuration
    cmd = f"python -m bot --room_url {room_url} --token {token}"
    cmd = cmd.split()
    worker_props = {
        "config": {
            "image": image,
            "auto_destroy": True,
            "init": {"cmd": cmd},
            "restart": {"policy": "no"},
            "guest": {"cpu_kind": "shared", "cpus": 1, "memory_mb": 1024},
        },
    }

    # Spawn a new machine instance
    res = requests.post(
        f"{FLY_API_HOST}/apps/{FLY_APP_NAME}/machines",
        headers=FLY_HEADERS,
        json=worker_props,
    )

    if res.status_code != 200:
        raise Exception(f"Problem starting a bot worker: {res.text}")

    # Wait for the machine to enter the started state
    vm_id = res.json()["id"]

    for _ in range(MAX_RETRIES):
        state = get_machine_status(vm_id)

        if state == "started":
            return vm_id

        time.sleep(RETRY_DELAY)

    raise Exception(f"Bot failed to enter started state after {MAX_RETRIES} retries")


def running_bot_locally(room_url: str, token: str, mode: str, analysis: str):
    # Use the same image as the bot runner

    logging.debug(f"Starting agent for room: {room_url}")
    logging.debug(f"Token: {token}")
    logging.debug(f"Mode: {mode}")
    logging.debug(f"Analysis: {analysis if analysis else 'None'}")

    # Machine configuration
    cmd = f"python src/bot.py --room_url {room_url} --token {token} --mode {mode} --analysis 'workattesla'"
    cmd = cmd.split()

    # Run the bot locally
    try:
        os.system(f"nohup {' '.join(cmd)} > bot.log 2>&1 &")
    except Exception as e:
        raise Exception(f"Problem starting a bot worker: {e}")




    # Wait for the machine to enter the started state
    vm_id = 0


    return vm_id


def get_machine_status(vm_id: str):
    res = requests.get(
        f"{FLY_API_HOST}/apps/{FLY_APP_NAME}/machines/{vm_id}", headers=FLY_HEADERS
    )

    return res.json()["state"]
