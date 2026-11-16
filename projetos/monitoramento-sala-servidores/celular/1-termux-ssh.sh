# 1º passo no Termux: atualiza os pacotes, liga o SSH só com chave e
# mantém o Termux acordado. Rodado uma vez, colado pelo ADB.
set -e
[ -n "$1" ] || { echo "uso: bash 1-termux-ssh.sh \"ssh-ed25519 AAAA... comentario\""; exit 1; }
CHAVE="$1"   # chave PÚBLICA do PC (conteúdo do arquivo .pub), passada como argumento
export DEBIAN_FRONTEND=noninteractive
APT="-y -o Dpkg::Options::=--force-confnew"

echo "== 1/3 atualizando pacotes do Termux =="
pkg update $APT
pkg upgrade $APT
pkg install $APT openssh

echo "== 2/3 SSH só com chave =="
mkdir -p ~/.ssh && chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
grep -qF "$CHAVE" ~/.ssh/authorized_keys || echo "$CHAVE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
CONF="$PREFIX/etc/ssh/sshd_config"
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' "$CONF"
grep -q '^PasswordAuthentication' "$CONF" || echo 'PasswordAuthentication no' >> "$CONF"
pkill sshd 2>/dev/null || true
sshd

echo "== 3/3 mantendo o Termux acordado =="
termux-wake-lock || true
echo "PRONTO-SSH"
