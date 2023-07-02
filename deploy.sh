#!/usr/bin/env bash

echo "Deploying files in dist/**"

ssh -i $SSH_USER@$SSH_ADDRESS 'cd html && rm -rf *'
sftp -i $SSH_USER@$SSH_ADDRESS:/home/$SSH_USER/html <<< "put dist/**"