#!/bin/env python3

import base64
import json
import subprocess

def printCreds(profile):
    encryptedPassword = base64.b64decode(profile['encryptedPassword'])
    decryption = subprocess.run(['gpg', '-d'], input=encryptedPassword, capture_output=True)
    print(f"Username: {profile['id']}")
    print(f"Password: {decryption.stdout.decode()}")
    print()

result = subprocess.run(['pulumi', 'stack', 'output', '-j'], capture_output=True, text=True)
data = json.loads(result.stdout)

owner_profile = data['ownerLoginProfile']
printCreds(owner_profile)

member_profiles = data['memberLoginProfiles']

print('- Must be at least 12 characters long')
print('- Must include at least one uppercase letter (A-Z)')
print('- Must include at least one lowercase letter (a-z)')
print('- Must include at least one number')
print()
for profile in member_profiles:
    printCreds(profile)
