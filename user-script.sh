set -o xtrace
set -o errexit
set -o pipefail

couchdb_bind_address=$(mdata-get couchdb_bind_address)
/opt/local/bin/gsed -i "s/;bind_address = 127\.0\.0\.1/bind_address = ${couchdb_bind_address//\./\\.}/" /opt/local/etc/couchdb/local.ini
/opt/local/bin/gsed -i "s/require_valid_user = true/;require_valid_user = true/g" /opt/local/etc/couchdb/local.ini

/usr/sbin/svcadm restart pkgsrc/couchdb