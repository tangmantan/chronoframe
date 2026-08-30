export default defineNuxtPlugin((_nuxtApp) => {
  const config = useRuntimeConfig()

  // 使用 computed 动态生成 script 数组
  const scripts = computed(() => {
    const result: any[] = []

    // Google Analytics
    const gtagId = (config.public as any)?.gtag?.id
    if (gtagId) {
      result.push(
        {
          src: `https://www.googletagmanager.com/gtag/js?id=${gtagId}`,
          async: true,
          tagPosition: 'head',
        },
        {
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtagId}');
          `.trim(),
          type: 'text/javascript',
          tagPosition: 'head',
        },
      )
    }

    // 等待设置初始化后再添加
    if (!isSettingsReady()) return result

    // Baidu Analytics
    const bdhmId = getSetting('analytics:bdhmId')

    console.log(bdhmId)

    if (bdhmId) {
      result.push({
        innerHTML: `
          var _hmt = _hmt || [];
          (function() {
            var hm = document.createElement("script");
            hm.src = "https://hm.baidu.com/hm.js?${bdhmId}";
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(hm, s);
          })();
        `.trim(),
        type: 'text/javascript',
        tagPosition: 'head',
      })
    }

    // Matomo Analytics
    const matomoEnabled = getSetting('analytics:matomo.enabled')
    const matomoUrl = getSetting('analytics:matomo.url')
    const matomoSiteId = getSetting('analytics:matomo.siteId')
    if (matomoEnabled && matomoUrl && matomoSiteId) {
      const url = String(matomoUrl).replace(/\/$/, '')
      result.push({
        innerHTML: `
          var _paq = window._paq = window._paq || [];
          _paq.push(['trackPageView']);
          _paq.push(['enableLinkTracking']);
          (function() {
            var u="${url}/";
            _paq.push(['setTrackerUrl', u+'matomo.php']);
            _paq.push(['setSiteId', '${matomoSiteId}']);
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
          })();
        `.trim(),
        type: 'text/javascript',
        tagPosition: 'head',
      })
    }

    return result
  })

  useHead({
    script: scripts,
  })
})
