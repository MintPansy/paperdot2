/**
 * Read 화면용 mock 데이터.
 * sessionStorage에 번역 데이터가 없을 때(직접 /read 진입 등) 사용합니다.
 * 4페이지+α (8문장/페이지 기준, 마지막에 수식 테스트 문장 1개 추가)
 */

export interface MockTranslationPair {
  docUnitId: number;
  sourceText: string;
  translatedText: string;
  /** 1-based 페이지. mock 데이터는 8문장당 1페이지 */
  sourcePage: number;
}

export const MOCK_FILE_NAME = "sample_test.pdf";

function withMockSourcePages(
  pairs: Omit<MockTranslationPair, "sourcePage">[]
): MockTranslationPair[] {
  return pairs.map((item, idx) => ({
    ...item,
    sourcePage: Math.floor(idx / 8) + 1,
  }));
}

export const MOCK_TRANSLATION_PAIRS: MockTranslationPair[] = withMockSourcePages([
  // ── PAGE 1: Introduction ──────────────────────────────────────────────
  {
    docUnitId: 1,
    sourceText:
      "An immediate consequence of this construction is that the many-body Hamiltonian in the Krylov basis takes the tridiagonal form $H = \\sum_{n=0}^{N_H-1} a_n |k_n\\rangle \\langle k_n| + \\sum_{n=1}^{N_H-1} \\left( b_n |k_{n-1}\\rangle \\langle k_n| + \\text{h.c.} \\right)$.",
    translatedText:
      "이 구성의 직접적인 결과로, Krylov 기에서 다체 Hamiltonian은 삼중대각 형태 $H = \\sum_{n=0}^{N_H-1} a_n |k_n\\rangle \\langle k_n| + \\sum_{n=1}^{N_H-1} \\left( b_n |k_{n-1}\\rangle \\langle k_n| + \\text{h.c.} \\right)$를 갖습니다.",
  },
  {
    docUnitId: 2,
    sourceText:
      "The overlap coefficients satisfy $c_n(t) = \\langle k_n | \\psi_t \\rangle = \\sum_E e^{-iEt} \\langle k_n | E \\rangle \\langle E | k_0 \\rangle$.",
    translatedText:
      "중첩 계수는 $c_n(t) = \\langle k_n | \\psi_t \\rangle = \\sum_E e^{-iEt} \\langle k_n | E \\rangle \\langle E | k_0 \\rangle$를 만족합니다.",
  },
  {
    docUnitId: 3,
    sourceText:
      "For the steady-state observable we use the long-time average $$S_{K,\\infty} = \\lim_{t \\to \\infty} \\frac{1}{t} \\int_0^t dt' \\, S_K(t').$$",
    translatedText:
      "정상 상태 관측량으로는 장시간 평균 $$S_{K,\\infty} = \\lim_{t \\to \\infty} \\frac{1}{t} \\int_0^t dt' \\, S_K(t')$$ 를 사용합니다.",
  },
  {
    docUnitId: 4,
    sourceText:
      "Our approach decomposes each paper into semantically coherent units and indexes them for efficient retrieval.",
    translatedText:
      "우리의 접근 방식은 각 논문을 의미적으로 일관된 단위로 분해하고 효율적인 검색을 위해 인덱싱합니다.",
  },
  {
    docUnitId: 5,
    sourceText:
      "We further augment the retrieved units with cross-sentence attention to capture dependencies that span paragraph boundaries.",
    translatedText:
      "또한 문단 경계를 넘나드는 의존성을 포착하기 위해 검색된 단위에 문장 간 어텐션을 추가로 적용합니다.",
  },
  {
    docUnitId: 6,
    sourceText:
      "The key contributions of this paper are threefold: a novel segmentation algorithm, a scalable retrieval pipeline, and a benchmark suite for evaluation.",
    translatedText:
      "본 논문의 주요 기여는 세 가지입니다: 새로운 분할 알고리즘, 확장 가능한 검색 파이프라인, 평가를 위한 벤치마크 모음.",
  },
  {
    docUnitId: 7,
    sourceText:
      "We validate ScholarDot on four datasets covering computer science, biomedical, and legal domains.",
    translatedText:
      "컴퓨터 과학, 생의학, 법률 분야를 포괄하는 네 가지 데이터셋에서 ScholarDot을 검증합니다.",
  },
  {
    docUnitId: 8,
    sourceText:
      "Experimental results show that our model outperforms strong baselines by an average of 6.3 F1 points on question answering benchmarks.",
    translatedText:
      "실험 결과, 우리 모델은 질의응답 벤치마크에서 강력한 기준 모델보다 평균 6.3 F1 포인트 높은 성능을 보입니다.",
  },

  // ── PAGE 2: Related Work & Method ────────────────────────────────────
  {
    docUnitId: 9,
    sourceText:
      "Retrieval-augmented generation (RAG) has emerged as a prominent paradigm for grounding language model outputs in external knowledge sources.",
    translatedText:
      "검색 증강 생성(RAG)은 언어 모델의 출력을 외부 지식 소스에 근거하게 하는 유력한 패러다임으로 부상했습니다.",
  },
  {
    docUnitId: 10,
    sourceText:
      "Prior work has primarily focused on short passages retrieved from web documents, leaving academic long-form texts underexplored.",
    translatedText:
      "기존 연구는 주로 웹 문서에서 검색된 짧은 단락에 집중해왔으며, 학술 장문 텍스트는 충분히 탐구되지 않았습니다.",
  },
  {
    docUnitId: 11,
    sourceText:
      "Dense passage retrieval methods encode queries and documents into a shared embedding space for efficient similarity search.",
    translatedText:
      "밀집 단락 검색 방법은 효율적인 유사도 검색을 위해 쿼리와 문서를 공유 임베딩 공간으로 인코딩합니다.",
  },
  {
    docUnitId: 12,
    sourceText:
      "Transformer-based cross-encoders achieve higher precision but are computationally expensive for large-scale retrieval.",
    translatedText:
      "트랜스포머 기반 크로스 인코더는 더 높은 정밀도를 달성하지만, 대규모 검색에서는 계산 비용이 높습니다.",
  },
  {
    docUnitId: 13,
    sourceText:
      "ScholarDot introduces a two-stage pipeline that combines a lightweight bi-encoder for candidate selection with a re-ranker for final scoring.",
    translatedText:
      "ScholarDot은 후보 선택을 위한 경량 바이인코더와 최종 점수 산출을 위한 재순위 기기를 결합한 2단계 파이프라인을 도입합니다.",
  },
  {
    docUnitId: 14,
    sourceText:
      "The segmentation module splits each paper into document units (DUs) aligned with logical discourse boundaries such as claims, evidence, and conclusions.",
    translatedText:
      "분할 모듈은 각 논문을 주장, 증거, 결론과 같은 논리적 담화 경계에 맞춰 문서 단위(DU)로 나눕니다.",
  },
  {
    docUnitId: 15,
    sourceText:
      "Boundary detection is performed using a fine-tuned BERT classifier trained on a corpus of 12,000 manually annotated academic paragraphs.",
    translatedText:
      "경계 탐지는 수동으로 주석 처리된 학술 단락 12,000개로 구성된 말뭉치에서 파인튜닝된 BERT 분류기를 사용해 수행됩니다.",
  },
  {
    docUnitId: 16,
    sourceText:
      "Each DU is encoded with a domain-adapted Sentence-BERT model and stored in a FAISS index for sub-millisecond lookup.",
    translatedText:
      "각 DU는 도메인 적응된 Sentence-BERT 모델로 인코딩되어 밀리초 미만의 조회를 위한 FAISS 인덱스에 저장됩니다.",
  },

  // ── PAGE 3: Experiments ──────────────────────────────────────────────
  {
    docUnitId: 17,
    sourceText:
      "We conduct experiments on four benchmarks: SciQA, BioASQ, QASPER, and LegalBench, covering diverse scientific and professional domains.",
    translatedText:
      "우리는 다양한 과학 및 전문 분야를 포괄하는 SciQA, BioASQ, QASPER, LegalBench 네 가지 벤치마크에서 실험을 수행합니다.",
  },
  {
    docUnitId: 18,
    sourceText:
      "For all experiments, we use GPT-4o as the reader model and compare against BM25, DPR, and LongFormer baselines.",
    translatedText:
      "모든 실험에서 GPT-4o를 리더 모델로 사용하며, BM25, DPR, LongFormer 기준 모델과 비교합니다.",
  },
  {
    docUnitId: 19,
    sourceText:
      "Table 1 reports Exact Match (EM) and F1 scores averaged over five random seeds to reduce variance.",
    translatedText:
      "표 1은 분산을 줄이기 위해 다섯 가지 무작위 시드에 걸쳐 평균화된 정확 일치(EM) 및 F1 점수를 보고합니다.",
  },
  {
    docUnitId: 20,
    sourceText:
      "ScholarDot achieves 74.2 EM and 81.6 F1 on SciQA, surpassing the previous state-of-the-art by 4.8 and 6.1 points respectively.",
    translatedText:
      "ScholarDot은 SciQA에서 74.2 EM 및 81.6 F1을 달성하여 이전 최첨단 기술을 각각 4.8 및 6.1 포인트 능가합니다.",
  },
  {
    docUnitId: 21,
    sourceText:
      "On the biomedical BioASQ dataset, performance gains are particularly pronounced for multi-hop questions requiring evidence from multiple sections.",
    translatedText:
      "생의학 BioASQ 데이터셋에서는 여러 섹션의 증거를 필요로 하는 다중 홉 질문에서 성능 향상이 특히 두드러집니다.",
  },
  {
    docUnitId: 22,
    sourceText:
      "An ablation study confirms that the re-ranker contributes the largest single improvement (+3.2 F1), followed by cross-sentence attention (+1.7 F1).",
    translatedText:
      "제거 연구를 통해 재순위기가 가장 큰 단일 개선(+3.2 F1)에 기여하고, 그 다음으로 문장 간 어텐션(+1.7 F1)이 기여함을 확인합니다.",
  },
  {
    docUnitId: 23,
    sourceText:
      "Latency analysis shows that the full pipeline processes an average query in 340 ms on a single A100 GPU, meeting real-time constraints.",
    translatedText:
      "지연 시간 분석에서 전체 파이프라인이 단일 A100 GPU에서 평균 쿼리를 340ms 내에 처리하여 실시간 제약을 충족함을 보여줍니다.",
  },
  {
    docUnitId: 24,
    sourceText:
      "We also evaluate retrieval recall@10, finding that ScholarDot recovers 93.4% of gold evidence units, compared to 81.2% for DPR.",
    translatedText:
      "또한 검색 recall@10을 평가한 결과, ScholarDot이 DPR의 81.2%에 비해 금 증거 단위의 93.4%를 복원함을 발견합니다.",
  },

  // ── PAGE 4: Discussion & Conclusion ──────────────────────────────────
  {
    docUnitId: 25,
    sourceText:
      "Error analysis reveals that the majority of remaining failures stem from ambiguous coreference chains that cross section boundaries.",
    translatedText:
      "오류 분석을 통해 나머지 실패의 대부분이 섹션 경계를 가로지르는 모호한 상호 참조 체인에서 비롯됨을 밝혀냅니다.",
  },
  {
    docUnitId: 26,
    sourceText:
      "We plan to address this limitation in future work by incorporating a coreference resolution module trained on scientific text.",
    translatedText:
      "우리는 과학 텍스트에서 훈련된 상호 참조 해결 모듈을 통합하여 이 한계를 향후 연구에서 해결할 계획입니다.",
  },
  {
    docUnitId: 27,
    sourceText:
      "Another direction is to extend ScholarDot to support multimodal inputs, including figures and tables embedded in academic papers.",
    translatedText:
      "또 다른 방향은 학술 논문에 삽입된 그림과 표를 포함한 다중 모달 입력을 지원하도록 ScholarDot을 확장하는 것입니다.",
  },
  {
    docUnitId: 28,
    sourceText:
      "The framework is publicly available along with pre-trained checkpoints and the full benchmark evaluation suite at our project repository.",
    translatedText:
      "이 프레임워크는 사전 훈련된 체크포인트 및 전체 벤치마크 평가 모음과 함께 우리의 프로젝트 저장소에서 공개적으로 이용 가능합니다.",
  },
  {
    docUnitId: 29,
    sourceText:
      "We hope that ScholarDot provides a useful foundation for building the next generation of intelligent reading assistants for researchers.",
    translatedText:
      "우리는 ScholarDot이 연구자를 위한 차세대 지능형 독서 보조 도구를 구축하는 데 유용한 기반을 제공하길 바랍니다.",
  },
  {
    docUnitId: 30,
    sourceText:
      "In conclusion, we have presented a retrieval-augmented framework that significantly advances the state of the art in academic document understanding.",
    translatedText:
      "결론적으로, 우리는 학술 문서 이해 분야에서 최첨단 기술을 크게 발전시키는 검색 증강 프레임워크를 제시했습니다.",
  },
  {
    docUnitId: 31,
    sourceText:
      "The proposed segmentation and retrieval components are modular and can be adapted to other long-document NLP tasks with minimal modification.",
    translatedText:
      "제안된 분할 및 검색 구성 요소는 모듈식이며 최소한의 수정으로 다른 장문 NLP 태스크에 적용할 수 있습니다.",
  },
  {
    docUnitId: 32,
    sourceText:
      "We believe this work opens a promising path toward AI systems that can read, reason, and synthesize knowledge from the scientific literature as effectively as human experts.",
    translatedText:
      "우리는 이 연구가 인간 전문가만큼 효과적으로 과학 문헌에서 지식을 읽고, 추론하고, 종합할 수 있는 AI 시스템을 향한 유망한 길을 열어준다고 믿습니다.",
  },
  // 로그인 전 /read mock·데모에서 KaTeX 렌더 확인용 (마지막 문장)
  {
    docUnitId: 33,
    sourceText:
      "[Sample math] The quadratic formula reads $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$; for a normalized state, $\\langle \\psi | \\psi \\rangle = 1$.",
    translatedText:
      "[수식 샘플] 이차방정식 근의 공식은 $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$이고, 정규화된 상태에 대해 $\\langle \\psi | \\psi \\rangle = 1$입니다.",
  },
]);
