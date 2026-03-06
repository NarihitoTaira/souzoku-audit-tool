/**
 * 相続税AI品質監査ツール - 知識ベースライブラリ
 *
 * 国税庁「相続税の申告要領」「財産評価基本通達」に基づく
 * 主要チェックポイントを管理するモジュール
 */

export interface KnowledgeCheckpoint {
  id: string;
  category: string;
  title: string;
  description: string;
  checkpoints: string[];
  reference: string;
  severity: "high" | "medium" | "low";
}

// 評価額チェックポイント
export const valuationCheckpoints: KnowledgeCheckpoint[] = [
  {
    id: "VC-001",
    category: "土地評価",
    title: "路線価方式の補正率確認",
    description: "路線価方式による宅地評価では、各種補正率の適用漏れがないか確認する",
    checkpoints: [
      "奥行価格補正率の適用（通達15条）",
      "側方路線影響加算率の適用（角地の場合、通達16条）",
      "二方路線影響加算率の適用（通達17条）",
      "不整形地補正率の適用（通達20条）",
      "間口狭小補正率の適用（通達20-3条）",
      "奥行長大補正率の適用（通達20-4条）",
      "がけ地補正率の適用（通達20-5条）",
    ],
    reference: "財産評価基本通達第15条～第20条の5",
    severity: "high",
  },
  {
    id: "VC-002",
    category: "土地評価",
    title: "倍率方式の適用確認",
    description: "路線価が定められていない地域では倍率方式を正しく適用する",
    checkpoints: [
      "固定資産税評価額の正確性",
      "国税庁の評価倍率表との照合",
      "地目（宅地/田/畑/山林）の確認",
    ],
    reference: "財産評価基本通達第21条",
    severity: "medium",
  },
  {
    id: "VC-003",
    category: "有価証券",
    title: "上場株式の4つの評価額比較",
    description: "上場株式は4つの価額のうち最も低い額で評価する",
    checkpoints: [
      "課税時期の最終価格",
      "課税時期の月の月平均額",
      "前月の月平均額",
      "前々月の月平均額",
      "4つの中で最も低い価額を選択しているか",
    ],
    reference: "財産評価基本通達第169条",
    severity: "medium",
  },
  {
    id: "VC-004",
    category: "預貯金",
    title: "預貯金の既経過利息",
    description: "死亡日時点の残高に既経過利息を加算しているか確認する",
    checkpoints: [
      "残高証明書が死亡日時点のものであること",
      "既経過利息の計算（源泉所得税控除後）",
      "外貨預金のTTBレート換算",
    ],
    reference: "財産評価基本通達第203条",
    severity: "low",
  },
];

// 添付書類チェックポイント
export const documentCheckpoints: KnowledgeCheckpoint[] = [
  {
    id: "DC-001",
    category: "添付書類",
    title: "基本添付書類の確認",
    description: "相続税申告に必須の基本書類が揃っているか確認する",
    checkpoints: [
      "被相続人の出生から死亡までの連続した戸籍謄本",
      "相続人全員の現在の戸籍謄本",
      "相続人全員の住民票の写し",
      "被相続人の住民票の除票",
      "マイナンバーの確認書類",
    ],
    reference: "相続税法施行規則第16条",
    severity: "high",
  },
  {
    id: "DC-002",
    category: "添付書類",
    title: "遺産分割関連書類",
    description: "法定相続分以外で分割する場合に必要な書類",
    checkpoints: [
      "遺産分割協議書（全相続人の署名・実印）",
      "印鑑証明書（発行後3ヶ月以内）",
      "遺言書（ある場合は検認済みのもの）",
    ],
    reference: "相続税法第27条",
    severity: "high",
  },
  {
    id: "DC-003",
    category: "添付書類",
    title: "財産評価関連書類",
    description: "各種財産の評価に必要な証明書類",
    checkpoints: [
      "固定資産評価証明書",
      "登記簿謄本（不動産）",
      "預貯金の残高証明書（死亡日時点）",
      "有価証券の評価明細書",
      "生命保険金の支払通知書",
      "退職手当金の支給明細書",
    ],
    reference: "財産評価基本通達",
    severity: "medium",
  },
];

// 特例適用チェックポイント
export const specialProvisionCheckpoints: KnowledgeCheckpoint[] = [
  {
    id: "SP-001",
    category: "特例措置",
    title: "小規模宅地等特例（居住用）",
    description: "特定居住用宅地等として330㎡まで80%減額の要件確認",
    checkpoints: [
      "対象宅地が被相続人の居住用であること",
      "取得者要件（配偶者/同居親族/家なき子）",
      "面積上限330㎡の確認",
      "超過分は通常評価であること",
      "申告期限までの継続居住・保有要件",
      "遺産分割の完了",
    ],
    reference: "租税特別措置法第69条の4",
    severity: "high",
  },
  {
    id: "SP-002",
    category: "特例措置",
    title: "小規模宅地等特例（事業用）",
    description: "特定事業用宅地等として400㎡まで80%減額の要件確認",
    checkpoints: [
      "対象宅地が被相続人の事業用であること",
      "事業承継の要件充足",
      "面積上限400㎡の確認",
      "居住用との併用計算（限度面積の調整）",
    ],
    reference: "租税特別措置法第69条の4第3項",
    severity: "high",
  },
  {
    id: "SP-003",
    category: "特例措置",
    title: "配偶者税額軽減",
    description: "配偶者の相続税軽減の正確な適用",
    checkpoints: [
      "法定相続分の正確な計算",
      "配偶者の取得財産額",
      "1億6千万円との比較",
      "申告期限までの遺産分割完了",
      "二次相続への影響検討",
    ],
    reference: "相続税法第19条の2",
    severity: "medium",
  },
  {
    id: "SP-004",
    category: "特例措置",
    title: "農地等の納税猶予",
    description: "農業相続人が農地を取得した場合の納税猶予",
    checkpoints: [
      "農業相続人の要件確認",
      "対象農地の確認",
      "農業委員会の証明書",
      "継続届出の必要性の説明",
    ],
    reference: "租税特別措置法第70条の6",
    severity: "medium",
  },
];

// 全チェックポイントを統合して取得
export function getAllCheckpoints(): KnowledgeCheckpoint[] {
  return [
    ...valuationCheckpoints,
    ...documentCheckpoints,
    ...specialProvisionCheckpoints,
  ];
}

// カテゴリ別にフィルタ
export function getCheckpointsByCategory(
  category: string
): KnowledgeCheckpoint[] {
  return getAllCheckpoints().filter((cp) => cp.category === category);
}

// 重要度別にフィルタ
export function getCheckpointsBySeverity(
  severity: "high" | "medium" | "low"
): KnowledgeCheckpoint[] {
  return getAllCheckpoints().filter((cp) => cp.severity === severity);
}
