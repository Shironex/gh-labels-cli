import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'GitHub Labels CLI',
  description: 'Command-line tool for managing labels in GitHub repositories',
  base: '/gh-labels-cli/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'GitHub', link: 'https://github.com/Shironex/gh-labels-cli' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
          ],
        },
        {
          text: 'Usage',
          items: [
            { text: 'Basic Commands', link: '/guide/basic-commands' },
            { text: 'Interactive Mode', link: '/guide/interactive-mode' },
            { text: 'Label Templates', link: '/guide/label-templates' },
            { text: 'Label Best Practices', link: '/guide/best-practices' },
          ],
        },
        {
          text: 'Development',
          items: [{ text: 'Contributing', link: '/guide/contributing' }],
        },
      ],
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/Shironex/gh-labels-cli' }],
  },
});
