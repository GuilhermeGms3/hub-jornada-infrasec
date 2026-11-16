# Roda no Termux (via SSH): instala o Debian com proot-distro e, dentro
# dele, o Zabbix agent 2 do repositório oficial (versão 7.0 LTS, arm64).
set -e
export DEBIAN_FRONTEND=noninteractive
APT="-y -o Dpkg::Options::=--force-confnew"

pkg install $APT proot-distro
proot-distro list 2>/dev/null | grep -q "debian.*installed" || proot-distro install debian || true

proot-distro login debian -- bash -c '
set -e
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y wget ca-certificates procps iputils-ping
. /etc/os-release
DEB="zabbix-release_latest_7.0+debian${VERSION_ID}_all.deb"
wget -q "https://repo.zabbix.com/zabbix/7.0/debian/pool/main/z/zabbix-release/$DEB" -O /tmp/zr.deb
dpkg -i /tmp/zr.deb
apt-get update
apt-get install -y zabbix-agent2
zabbix_agent2 -V | head -1
'
echo PRONTO-DEBIAN
