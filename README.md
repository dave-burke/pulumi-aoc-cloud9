# Cloud9 with Pulumi

This [Pulumi](pulumi.com/) project creates an AWS Cloud9 environment with an owner, and members. Members are given a login profile, and must change their password from the generated one the first time they log in.

Member names are defined as secrets in the config, because they will often be people's names.

Login profile passwords are encrypted by a PGP key defined as a secret in the config. After running `pulumi up` you can get a print out of the passwords by running `get_passwords.py` with Python3.

Once the stack is created, the owner can log in and invite members to the environment.

