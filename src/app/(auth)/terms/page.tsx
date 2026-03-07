export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in py-4">
      <div>
        <h1 className="text-2xl font-bold gradient-text">利用規約</h1>
        <p className="text-xs text-muted-foreground mt-1">
          最終更新日: 2026年3月7日
        </p>
      </div>

      <div className="glass rounded-xl p-6 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-base font-semibold mb-2">第1条（適用）</h2>
          <p className="text-muted-foreground">
            本規約は、本サービス「補助金採択可能性診断ツール」（以下「本サービス」）の利用に関する条件を、
            本サービスを利用するすべてのユーザー（以下「利用者」）と運営者との間で定めるものです。
            利用者は、本サービスを利用することにより、本規約に同意したものとみなされます。
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">第2条（サービスの内容）</h2>
          <p className="text-muted-foreground">
            本サービスは、中小企業向けの補助金採択可能性をAIが診断するツールです。
            以下の機能を提供します。
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>事業計画書（PDF/Word/Excel）のアップロードおよびテキスト解析</li>
            <li>AIによる採択可能性のスコアリング・改善指摘・加点施策の提案</li>
            <li>過去の採択事例との照合（類似事例検索）</li>
            <li>補助金ナレッジ（審査基準・申請のコツ）の閲覧</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">第3条（AI診断結果の位置づけ・免責）</h2>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-amber-800 dark:text-amber-200">
            <p className="font-medium mb-2">⚠️ 重要</p>
            <ul className="space-y-2 text-sm">
              <li>
                本サービスが提供するAI診断結果は、あくまで<strong>参考情報</strong>であり、
                補助金申請に関する最終的な判断は利用者ご自身の責任で行ってください。
              </li>
              <li>
                運営者は、AI診断結果の正確性、完全性、有用性について<strong>いかなる保証も行いません</strong>。
              </li>
              <li>
                本サービスの利用により生じた損害（不採択、申請費用、その他の損害を含む）について、
                運営者は<strong>一切の責任を負いません</strong>。
              </li>
              <li>
                AIモデル（Google Gemini等）は補助金審査の専門家ではなく、
                誤った情報を生成する可能性があります。
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">第4条（アカウント管理）</h2>
          <ol className="list-decimal list-inside text-muted-foreground space-y-1">
            <li>利用者は、正確な情報を提供してアカウントを登録するものとします。</li>
            <li>アカウントのログイン情報（パスワード等）は、利用者自身の責任で管理してください。</li>
            <li>アカウントの不正利用により生じた損害について、運営者は責任を負いません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">第5条（禁止事項）</h2>
          <p className="text-muted-foreground mb-2">
            利用者は、以下の行為を行ってはなりません。
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>法令または公序良俗に反する行為</li>
            <li>第三者の個人情報を不正に取得・利用する行為</li>
            <li>本サービスのサーバーに過度な負荷をかける行為</li>
            <li>本サービスのリバースエンジニアリング・不正アクセス</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">第6条（サービスの変更・停止）</h2>
          <p className="text-muted-foreground">
            運営者は、利用者への事前通知なく、本サービスの内容を変更、
            または提供を一時停止・終了することができます。
            これにより利用者に生じた損害について、運営者は責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">第7条（知的財産権）</h2>
          <p className="text-muted-foreground">
            本サービスに関するすべての知的財産権は運営者に帰属します。
            利用者がアップロードしたデータの知的財産権は、利用者に帰属します。
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">第8条（準拠法・管轄）</h2>
          <p className="text-muted-foreground">
            本規約は日本法に準拠し、日本法に従って解釈されるものとします。
            本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>
      </div>
    </div>
  );
}
