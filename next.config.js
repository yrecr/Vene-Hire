/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
};

module.exports = nextConfig;
