#!/usr/bin/env bash

echo "Deploying files in dist/**"

ssh $SSH_USER@$SSH_ADDRESS 'cd html && rm -rf *'
sftp $SSH_USER@$SSH_ADDRESS:/home/$SSH_USER/html <<< "put dist/**"