const quizData = [
  {
    id: 1,
    subject: "您的帳號發生異常登入",
    sender: "security@micros0ft-support.com",
    content: `
      <p>親愛的用戶，</p>
      <p>我們偵測到您的帳號在未知的裝置上登入。為了確保您的帳號安全，請立即驗證您的身分。</p>
      <p style="text-align: center; margin: 20px 0;">
        <a href="#" class="btn-primary" onclick="return false;">立即驗證帳號</a>
      </p>
      <p>如果您未執行此操作，請忽略此郵件。</p>
      <p>Microsoft 安全團隊</p>
    `,
    clues: [
      { id: "c1", target: "sender", reason: "⚠️ 寄件者網域拼寫錯誤！他是 'micros0ft' 而不是 'microsoft'。" },
      { id: "c2", target: "greeting", reason: "⚠️ 泛稱陷阱！正規官方郵件通常會直接稱呼您的姓名，而非「親愛的用戶」。" },
      { id: "c3", target: "link", reason: "⚠️ 可疑的連結！滑鼠游標懸停檢查時，可能會發現網址導向不相關的網站。" },
      { id: "c4", target: "urgency", reason: "⚠️ 製造恐慌！釣魚郵件常利用「異常登入」或「帳號停權」來迫使您快速行動。" },
      { id: "c5", target: "signature", reason: "⚠️ 簽名檔過於簡略，缺乏具體的聯絡資訊或官方標誌。" }
    ]
  },
  {
    id: 2,
    subject: "恭喜！您中了大獎 iPhone 15 Pro",
    sender: "promo@lucky-draw-winner.xyz",
    content: `
      <p>親愛的幸運兒，</p>
      <p>恭喜您被選為我們年度抽獎活動的特等獎得主！您已獲得一台全新的 <strong>iPhone 15 Pro</strong>。</p>
      <p>請點擊下方連結領取您的獎品。請注意，領獎資格將在 24 小時後失效！</p>
      <p style="text-align: center; margin: 20px 0;">
        <a href="#" class="btn-primary" onclick="return false;">點此領取獎品</a>
      </p>
      <p>祝您好運，<br>全球抽獎中心</p>
    `,
    clues: [
      { id: "c1", target: "sender", reason: "⚠️ 寄件者網域奇怪 (xyz)，且非知名官方活動網域。" },
      { id: "c2", target: "subject", reason: "⚠️ 標題過於聳動，「恭喜中獎」是典型的釣魚誘餌。" },
      { id: "c3", target: "urgency", reason: "⚠️ 時間壓力！「24小時後失效」意在讓您來不及思考就點擊。" },
      { id: "c4", target: "content", reason: "⚠️ 亦真亦假的好康，通常伴隨著要求您預付「運費」或「稅金」的詐騙。" },
      { id: "c5", target: "link", reason: "⚠️ 不明連結，不要點擊來歷不明的領獎網址。" }
    ]
  },
  {
    id: 3,
    subject: "緊急：發票未付款通知",
    sender: "billing@amaz0n-invoice.net",
    content: `
      <p>客戶您好，</p>
      <p>這是一封自動通知，您的最近一筆訂單 (#123-456789) 付款失敗。</p>
      <p>請立即更新您的付款資訊，以免您的帳號被暫停使用。</p>
      <p style="text-align: center; margin: 20px 0;">
        <a href="#" class="btn-primary" onclick="return false;">更新付款資訊</a>
      </p>
      <p>謝謝，<br>帳務部門</p>
    `,
    clues: [
      { id: "c1", target: "sender", reason: "⚠️ 仿冒 Amazon 網域！注意 'amaz0n' 的拼寫錯誤。" },
      { id: "c2", target: "greeting", reason: "⚠️ 使用「客戶您好」這種模糊稱呼，而非您的真實姓名。" },
      { id: "c3", target: "urgency", reason: "⚠️ 威脅「帳號被暫停」，製造恐慌情緒。" },
      { id: "c4", target: "link", reason: "⚠️ 連結要求輸入敏感個資（信用卡號），務必確認網址是否為官方。" },
      { id: "c5", target: "content", reason: "⚠️ 缺乏具體的訂單細節（如商品名稱），只有模糊的訂單編號。" }
    ]
  },
  {
    id: 4,
    subject: "薪資調整通知",
    sender: "hr-update@company-internal-portal.com",
    content: `
      <p>各位同仁，</p>
      <p>公司已完成本年度的薪資審查，請點擊下方連結查看您個人的薪資調整幅度。</p>
      <p>請使用您的員工編號和密碼登入查看。</p>
      <p style="text-align: center; margin: 20px 0;">
        <a href="#" class="btn-primary" onclick="return false;">查看薪資調整</a>
      </p>
      <p>人資部</p>
    `,
    clues: [
      { id: "c1", target: "sender", reason: "⚠️ 寄件者雖看似內部 (company-internal)，但可能是外部註冊的假網域。" },
      { id: "c2", target: "subject", reason: "⚠️ 利用員工最關心的「薪資」議題，降低戒心。" },
      { id: "c3", target: "link", reason: "⚠️ 連結導向偽造的登入頁面，意圖竊取員工帳密。" },
      { id: "c4", target: "greeting", reason: "⚠️ 「各位同仁」群發信件，但內容應為個人隱私資訊。" },
      { id: "c5", target: "content", reason: "⚠️ 誘使輸入密碼。內部系統通常無需透過郵件連結重新登入。" }
    ]
  },
  {
    id: 5,
    subject: "[重要] 您的雲端硬碟容量已滿",
    sender: "support@g0ogle-drive-storage.com",
    content: `
      <p>用戶您好，</p>
      <p>您的雲端硬碟儲存空間已達到 100%。您將無法再上傳新檔案或接收電子郵件。</p>
      <p>您可以免費升級 50GB 空間，請在 48 小時內啟用。</p>
      <p style="text-align: center; margin: 20px 0;">
        <a href="#" class="btn-primary" onclick="return false;">免費升級空間</a>
      </p>
      <p>雲端團隊</p>
    `,
    clues: [
      { id: "c1", target: "sender", reason: "⚠️ 偽造 Google 網域！'g0ogle' 是經典的釣魚手法。" },
      { id: "c2", target: "content", reason: "⚠️ 「無法接收郵件」是常見的恐嚇手法，事實上硬碟滿了通常只影響上傳。" },
      { id: "c3", target: "offer", reason: "⚠️ 「免費升級」過於好康，通常是餌。" },
      { id: "c4", target: "urgency", reason: "⚠️ 設定「48小時」期限，逼迫您衝動點擊。" },
      { id: "c5", target: "link", reason: "⚠️ 連結導向釣魚網站，可能要求輸入帳密或下載惡意軟體。" }
    ]
  }
];
