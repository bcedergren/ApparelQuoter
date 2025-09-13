#!/bin/bash

echo "Installing missing dependencies for ApparelQuoter..."

# Install the missing dependencies
npm install formidable@^3.5.1 uuid@^9.0.1

# Install the missing dev dependencies
npm install --save-dev @types/formidable@^3.4.5

echo "Dependencies installed successfully!"
echo "You can now run 'npm run dev' to start the development server."
