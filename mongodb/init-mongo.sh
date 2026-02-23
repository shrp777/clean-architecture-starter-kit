mongosh -- "$MONGO_INITDB_DATABASE" <<EOF
    db.createUser({user: '$MONGO_INITDB_USERNAME', pwd: '$MONGO_INITDB_PASSWORD', roles: ["dbOwner"]});
    db.createCollection('members', {capped: false});
    db.createCollection('books', {capped: false});
    db.createCollection('loans', {capped: false});
EOF
