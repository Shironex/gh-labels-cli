import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'GitHub Labels CLI',
  description: 'Command-line tool for managing labels in GitHub repositories',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      // { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/Shironex/gh-labels-cli' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Configuration', link: '/guide/configuration' },
          ],
        },
        {
          text: 'Usage',
          items: [
            { text: 'Basic Commands', link: '/guide/basic-commands' },
            { text: 'Interactive Mode', link: '/guide/interactive-mode' },
            { text: 'Working with Labels', link: '/guide/working-with-labels' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Commands', link: '/api/commands' },
            { text: 'GitHub Integration', link: '/api/github' },
            { text: 'Configuration', link: '/api/configuration' },
            { text: 'Types', link: '/api/types' },
            { text: 'Utilities', link: '/api/utilities' },
          ],
        },
      ],
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/your-username/gh-labels-cli' }],
  },
});
