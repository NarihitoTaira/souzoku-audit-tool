export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in py-4">
      <div>
        <h1 className="text-2xl font-bold gradient-text">
          プライバシーポリシー
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          最終更新日: 2026年3月7日
        </p>
      </div>

      <div className="glass rounded-xl p-6 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-base font-semibold mb-2">1. はじめに</h2>
          <p className="text-muted-foreground">
            本プライバシーポリシーは、「相続税AI品質監査ツール」（以下「本サービス」）における
            個人情報の取り扱いについて定めたものです。
            本サービスは、個人情報の保護に関する法律（個人情報保護法）その他の関連法令を遵守し、
            利用者の個人情報を適切に管理します。
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">2. 収集する情報</h2>
          <p className="text-muted-foreground mb-2">
            本サービスでは、以下の情報を収集します。
          </p>

          <h3 className="text-sm font-medium mt-3 mb-1">
            2-1. アカウント情報
          </h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>メールアドレス</li>
            <li>パスワード（ハッシュ化して保存）</li>
            <li>表示名（税理士名）</li>
          </ul>

          <h3 className="text-sm font-medium mt-3 mb-1">
            2-2. アップロードされた書類データ
          </h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>相続税申告書（PDF/Excel）</li>
            <li>
              上記に含まれる被相続人・相続人の氏名、住所、財産情報、評価額等
            </li>
          </ul>

          <h3 className="text-sm font-medium mt-3 mb-1">
            2-3. 利用状況データ
          </h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>監査実行履歴</li>
            <li>検索クエリ</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">3. 情報の利用目的</h2>
          <p className="text-muted-foreground mb-2">
            収集した情報は、以下の目的にのみ使用します。
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>本サービスの提供・運営・改善</li>
            <li>AI監査機能の実行（書類データのテキスト解析）</li>
            <li>類似事例の検索・照合</li>
            <li>ユーザー認証およびアカウント管理</li>
            <li>サービスに関する重要なお知らせの連絡</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">
            4. 第三者への情報提供
          </h2>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-muted-foreground">
              本サービスでは、AI監査機能の実行にあたり、アップロードされた書類の
              <strong>テキストデータ</strong>を以下の外部サービスに送信します。
            </p>
            <table className="w-full mt-3 text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-2 font-medium">サービス</th>
                  <th className="text-left py-2 font-medium">提供元</th>
                  <th className="text-left py-2 font-medium">目的</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/20">
                  <td className="py-2">Gemini API</td>
                  <td className="py-2">Google LLC</td>
                  <td className="py-2">AI監査の実行</td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="py-2">Supabase</td>
                  <td className="py-2">Supabase Inc.</td>
                  <td className="py-2">データベース・認証</td>
                </tr>
                <tr>
                  <td className="py-2">Vercel</td>
                  <td className="py-2">Vercel Inc.</td>
                  <td className="py-2">アプリケーション配信</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground mt-2">
            上記以外の第三者に対して、利用者の同意なく個人情報を提供することはありません。
            ただし、法令に基づく場合を除きます。
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">5. データの保管</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>
              データベースは <strong>Supabase（東京リージョン）</strong>
              に保管されます
            </li>
            <li>パスワードはハッシュ化され、平文では保存されません</li>
            <li>
              データベースへのアクセスは
              <strong>Row Level Security（RLS）</strong>
              により、ログインユーザー本人のデータのみに制限されます
            </li>
            <li>通信はすべてSSL/TLS（HTTPS）で暗号化されます</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">
            6. 利用者の権利
          </h2>
          <p className="text-muted-foreground mb-2">
            利用者は、以下の権利を有します。
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>
              <strong>開示請求</strong>:
              自身の個人情報の開示を請求できます
            </li>
            <li>
              <strong>訂正・削除</strong>:
              自身の個人情報の訂正・削除を請求できます
            </li>
            <li>
              <strong>利用停止</strong>:
              自身の個人情報の利用停止を請求できます
            </li>
            <li>
              <strong>アカウント削除</strong>:
              アカウントの完全な削除を請求できます。削除後、関連するすべてのデータは消去されます
            </li>
          </ul>
          <p className="text-muted-foreground mt-2">
            上記の請求は、運営者へのメール連絡により行うことができます。
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">7. Cookie の使用</h2>
          <p className="text-muted-foreground">
            本サービスでは、認証セッションの管理のために Cookie
            を使用します。
            これらの Cookie
            は、ログイン状態の維持に必要なものであり、
            広告目的のトラッキングには使用しません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">
            8. ポリシーの変更
          </h2>
          <p className="text-muted-foreground">
            本ポリシーの内容は、法令の改正やサービスの変更に伴い、
            事前の通知なく変更することがあります。変更後のポリシーは、
            本ページに掲載した時点で効力を生じるものとします。
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">9. お問い合わせ</h2>
          <p className="text-muted-foreground">
            個人情報の取り扱いに関するお問い合わせは、
            本サービスの設定画面よりご連絡ください。
          </p>
        </section>
      </div>
    </div>
  );
}
