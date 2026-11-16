"""Real FRR checks. Run after compose up; no IOS emulation or synthetic outputs."""
import argparse
import pathlib
import subprocess
import time
ROOT = pathlib.Path(__file__).resolve().parent

def run(service, *args):
    return subprocess.run(["docker", "compose", "exec", "-T", service, *args], cwd=ROOT, check=True, capture_output=True, text=True).stdout

def configure(area):
    return run("r2", "vtysh", "-c", "configure terminal", "-c", "interface eth0", "-c", "no ipv6 ospf6 area 0.0.0.0", "-c", "no ipv6 ospf6 area 0.0.0.1", "-c", "ipv6 ospf6 area " + area)

parser = argparse.ArgumentParser()
parser.add_argument("mode", choices=["healthy", "fault", "recover"], default="healthy", nargs="?")
args = parser.parse_args()
if args.mode in ("fault", "recover"):
    configure("0.0.0.1" if args.mode == "fault" else "0.0.0.0")
expected = args.mode != "fault"
for attempt in range(45):
    try:
        neighbors = run("r1", "vtysh", "-c", "show ipv6 ospf6 neighbor")
        routes = run("r1", "vtysh", "-c", "show ipv6 route ospf6")
    except subprocess.CalledProcessError as error:
        neighbors, routes = error.stdout, error.stderr
        time.sleep(2)
        continue
    full = "Full" in neighbors and "2.2.2.2" in neighbors
    learned = "2001:db8:2::1/128" in routes
    if full == expected and learned == expected:
        break
    time.sleep(2)
else:
    raise SystemExit("Expected adjacency/route state not reached.\n" + neighbors + routes)
print(neighbors, routes)
if expected:
    for router, source, target in [("r1", "2001:db8:1::1", "2001:db8:2::1"), ("r2", "2001:db8:2::1", "2001:db8:1::1")]:
        print(run(router, "ping", "-6", "-c", "3", "-I", source, target))
print("PASS: " + args.mode + " (real FRR state)")
