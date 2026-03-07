/**
 * 中小企業向け補助金・採択可能性診断ツール - 補助金ナレッジベース
 *
 * 主要補助金（事業再構築・ものづくり・IT導入・小規模事業者持続化）の
 * 審査基準チェックポイントを管理するモジュール
 */

export interface SubsidyCheckpoint {
  id: string;
  subsidyName: string;
  category: string;
  title: string;
  description: string;
  checkpoints: string[];
  scoringCriteria: string;
  maxPoints: number;
  tips: string;
}

// 事業再構築補助金
export const jigyouSaikouchiku: SubsidyCheckpoint[] = [
  {
    id: "SR-001",
    subsidyName: "事業再構築補助金",
    category: "事業計画の妥当性",
    title: "補助事業の具体的取組内容",
    description:
      "現在の事業の状況、強み・弱み、機会・脅威、事業環境、事業再構築の必要性を明確に記載する",
    checkpoints: [
      "SWOT分析が論理的に整理されているか",
      "事業再構築の必要性が市場データで裏付けられているか",
      "具体的な取組内容が5W1Hで明確か",
      "事業再構築の類型（新分野展開・事業転換・業種転換等）との整合性",
      "補助事業の実施スケジュールが具体的か",
    ],
    scoringCriteria: "事業化に向けて、競合他社の動向を把握すること等を通じて市場ニーズを考慮するとともに、補助事業の実施方法及びスケジュールが妥当か",
    maxPoints: 20,
    tips: "SWOT分析は図表で視覚的に示し、各要素を箇条書きではなく文章で詳しく説明しましょう。",
  },
  {
    id: "SR-002",
    subsidyName: "事業再構築補助金",
    category: "市場の新規性",
    title: "市場の新規性・成長性",
    description:
      "新たに進出する市場の規模、成長性、ターゲット顧客を分析する",
    checkpoints: [
      "ターゲット市場のTAM/SAM/SOMが具体的に示されているか",
      "公的統計・調査レポートのエビデンスが引用されているか",
      "顧客ニーズの根拠（アンケート・ヒアリング結果等）があるか",
      "既存顧客との違い・新規顧客獲得戦略が明確か",
    ],
    scoringCriteria: "市場ニーズや自社の強みを踏まえ、「選択と集中」を戦略的に組み合わせ、リソースの最適化を図る取組であるか",
    maxPoints: 20,
    tips: "市場規模は必ず「出典」を明記してください。矢野経済研究所、富士経済、経産省統計等が有効です。",
  },
  {
    id: "SR-003",
    subsidyName: "事業再構築補助金",
    category: "実現可能性",
    title: "実施体制と実現可能性",
    description:
      "事業を実施するための社内外の体制、リソース確保の計画を示す",
    checkpoints: [
      "組織体制図があり、各メンバーの役割が明確か",
      "代表者・キーパーソンの経歴・スキルが記載されているか",
      "外部パートナー（ITベンダー・コンサル等）との連携体制",
      "必要な許認可・資格の確認",
      "設備投資の仕様・選定理由が具体的か",
    ],
    scoringCriteria: "補助事業の課題が明確になっており、その課題の解決方法が明確かつ妥当であるか",
    maxPoints: 20,
    tips: "実施体制図はビジュアルで分かりやすく。外部連携先は社名まで記載すると説得力が増します。",
  },
  {
    id: "SR-004",
    subsidyName: "事業再構築補助金",
    category: "収益計画",
    title: "収益計画と費用対効果",
    description:
      "補助事業終了後の収益計画、投資回収計画、自走計画を具体的に示す",
    checkpoints: [
      "3〜5年の売上・利益計画が年度別に示されているか",
      "売上見込みの根拠（単価×数量等）が具体的か",
      "付加価値額の年率3%以上の増加計画があるか",
      "補助事業終了後の自走計画が明確か",
      "投資回収期間が妥当か（3〜5年が目安）",
    ],
    scoringCriteria: "補助事業の成果が価格的・性能的に優位性や収益性を有し、事業化に至るまでの遂行方法及びスケジュールが妥当であるか",
    maxPoints: 20,
    tips: "付加価値額＝営業利益＋人件費＋減価償却費。この計算式を正しく使い、年率3%以上の伸びを示しましょう。",
  },
  {
    id: "SR-005",
    subsidyName: "事業再構築補助金",
    category: "政策適合性",
    title: "政策点・加点項目",
    description:
      "国の政策目標との整合性、加点項目への該当を確認する",
    checkpoints: [
      "DX（デジタル・トランスフォーメーション）との関連性",
      "GX（グリーン・トランスフォーメーション）との関連性",
      "地域経済への貢献・雇用創出効果",
      "事業承継・M&Aとの関連性（加点項目）",
      "パートナーシップ構築宣言の登録状況",
    ],
    scoringCriteria: "先端的なデジタル技術の活用、新しいビジネスモデルの構築等を通じて、地域のイノベーションに貢献し得る事業か",
    maxPoints: 20,
    tips: "加点項目はすべてチェックし、該当するものは根拠資料とともに記載することで採択確率が大幅にアップします。",
  },
];

// ものづくり補助金
export const monodzukuri: SubsidyCheckpoint[] = [
  {
    id: "MN-001",
    subsidyName: "ものづくり補助金",
    category: "技術面",
    title: "革新的な製品・サービスの開発",
    description:
      "中小企業が取り組む革新的な製品・サービス開発の内容と技術的な新規性",
    checkpoints: [
      "開発する製品・サービスの革新性が明確か",
      "既存技術との違い・優位性が説明されているか",
      "特許・知的財産権の取得見込みがあるか",
      "試作品・プロトタイプの開発計画が具体的か",
    ],
    scoringCriteria: "革新的な製品・サービスの開発またはプロセス改善が、地域経済の発展に寄与するものであるか",
    maxPoints: 25,
    tips: "「従来技術との比較表」を入れると、革新性が一目で伝わります。",
  },
  {
    id: "MN-002",
    subsidyName: "ものづくり補助金",
    category: "事業計画",
    title: "事業計画の妥当性",
    description:
      "付加価値額・給与支給総額・事業場内最低賃金の要件を満たす計画",
    checkpoints: [
      "付加価値額が年平均3%以上増加する計画か",
      "給与支給総額が年平均1.5%以上増加する計画か",
      "事業場内最低賃金が地域別最低賃金＋30円以上か",
      "計画の達成根拠が数値で示されているか",
    ],
    scoringCriteria: "事業計画における付加価値額、給与支給総額の増加目標が適切に設定されているか",
    maxPoints: 25,
    tips: "給与支給総額には法定福利費を含みません。計算間違いに注意しましょう。",
  },
  {
    id: "MN-003",
    subsidyName: "ものづくり補助金",
    category: "実施体制",
    title: "補助事業の実施体制",
    description:
      "事業を遂行するためのリソースと体制の確認",
    checkpoints: [
      "事業実施の中心人物の専門性・経験が示されているか",
      "生産性向上のための具体的プロセスが明確か",
      "設備投資の費用対効果が計算されているか",
      "スケジュール（ガントチャート等）が適切か",
    ],
    scoringCriteria: "補助事業実施のための体制や最近の財務状況等から、補助事業を適切に遂行できると期待できるか",
    maxPoints: 25,
    tips: "代表者の略歴は業歴中心に。関連する実績があれば具体的に記載しましょう。",
  },
];

// IT導入補助金
export const itDounyu: SubsidyCheckpoint[] = [
  {
    id: "IT-001",
    subsidyName: "IT導入補助金",
    category: "業務プロセス",
    title: "IT導入による業務効率化計画",
    description:
      "導入するITツールによる業務プロセスの改善・効率化の具体的な計画",
    checkpoints: [
      "導入するITツールの選定理由が明確か",
      "現状の業務課題が具体的に整理されているか",
      "導入後の業務フロー改善イメージが示されているか",
      "生産性向上の数値目標（削減時間・コスト等）があるか",
    ],
    scoringCriteria: "自社の経営課題を理解し、経営改善に向けたITツールの導入目的が明確であるか",
    maxPoints: 30,
    tips: "「導入前後の業務フロー比較図」を作成すると効果を視覚的にアピールできます。",
  },
  {
    id: "IT-002",
    subsidyName: "IT導入補助金",
    category: "セキュリティ",
    title: "セキュリティ対策",
    description:
      "ITツール導入に伴うセキュリティ対策の計画",
    checkpoints: [
      "SECURITY ACTION（二つ星）を宣言しているか",
      "導入ツールのセキュリティ機能を確認しているか",
      "個人情報保護の方針が策定されているか",
      "インシデント対応計画があるか",
    ],
    scoringCriteria: "セキュリティ対策を適切に講じ、安全なIT環境を構築する計画があるか",
    maxPoints: 20,
    tips: "IPA「SECURITY ACTION」は事前に宣言が必要です。申請前に必ず手続きしましょう。",
  },
];

// 小規模事業者持続化補助金
export const jizokuka: SubsidyCheckpoint[] = [
  {
    id: "JZ-001",
    subsidyName: "小規模事業者持続化補助金",
    category: "経営計画",
    title: "経営計画書の充実度",
    description:
      "自社の経営状況と今後の方針を分かりやすく記載する",
    checkpoints: [
      "企業概要（沿革・事業内容）が分かりやすく記載されているか",
      "自社の強み・弱みが明確に分析されているか",
      "経営方針・今後のプランが具体的か",
      "市場動向・顧客ニーズの分析があるか",
    ],
    scoringCriteria: "自社の経営状況分析の妥当性。経営方針・目標と今後のプランの適切性",
    maxPoints: 30,
    tips: "写真・図表を多用して「読みやすさ」を重視しましょう。商工会議所の指導員にアドバイスをもらうのも有効です。",
  },
  {
    id: "JZ-002",
    subsidyName: "小規模事業者持続化補助金",
    category: "補助事業計画",
    title: "補助事業計画の有効性",
    description:
      "補助事業で実施する販路開拓等の取組内容",
    checkpoints: [
      "補助事業の内容が経営計画に基づいているか",
      "Web活用・チラシ・展示会等の具体的な取組内容があるか",
      "想定される効果が数値で示されているか",
      "経費内訳が妥当で補助対象経費に適合しているか",
    ],
    scoringCriteria: "補助事業計画の有効性。販路開拓等の取組内容の妥当性・革新性",
    maxPoints: 30,
    tips: "「なぜこの施策が有効なのか」の根拠を顧客ニーズに紐づけて説明するのがポイントです。",
  },
];

// 全チェックポイントを統合して取得
export function getAllCheckpoints(): SubsidyCheckpoint[] {
  return [
    ...jigyouSaikouchiku,
    ...monodzukuri,
    ...itDounyu,
    ...jizokuka,
  ];
}

// 補助金名別にフィルタ
export function getCheckpointsBySubsidy(
  subsidyName: string
): SubsidyCheckpoint[] {
  return getAllCheckpoints().filter((cp) => cp.subsidyName === subsidyName);
}

// カテゴリ別にフィルタ
export function getCheckpointsByCategory(
  category: string
): SubsidyCheckpoint[] {
  return getAllCheckpoints().filter((cp) => cp.category === category);
}

// 補助金名の一覧を取得
export function getSubsidyNames(): string[] {
  return Array.from(new Set(getAllCheckpoints().map((cp) => cp.subsidyName)));
}
