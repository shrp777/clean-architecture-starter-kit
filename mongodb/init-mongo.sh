mongosh -- "$MONGO_INITDB_DATABASE" <<EOF
    db.createUser({user: '$MONGO_INITDB_USERNAME', pwd: '$MONGO_INITDB_PASSWORD', roles: ["dbOwner"]});
    db.createCollection('books', {capped: false});
EOF
