// 15種類の会話パターン（6キャラクターの組み合わせ）
// 各組み合わせに対して複数のバリエーションを用意

const DIALOGUES = {
    // 浪人 vs 若侍
    'ronin_wakaSamurai': [
        [
            { speaker: 'wakaSamurai', text: '貴様のような流れ者に、俺が負けるものか！' },
            { speaker: 'ronin', text: '……口より先に、刀を抜け。' }
        ],
        [
            { speaker: 'wakaSamurai', text: 'その眼……何を見てきた？' },
            { speaker: 'ronin', text: '……お前が知る必要はない。' }
        ],
        [
            { speaker: 'ronin', text: '若いな。' },
            { speaker: 'wakaSamurai', text: '黙れ！若さは力だ！' }
        ]
    ],

    // 浪人 vs 老剣士
    'ronin_oldMaster': [
        [
            { speaker: 'oldMaster', text: '……良い殺気だ。久しぶりに血が騒ぐ。' },
            { speaker: 'ronin', text: '……。' }
        ],
        [
            { speaker: 'ronin', text: '……師と呼ばれた方か。' },
            { speaker: 'oldMaster', text: '昔の話よ。今はただの老いぼれ。' }
        ],
        [
            { speaker: 'oldMaster', text: '言葉は要らぬようだな。' },
            { speaker: 'ronin', text: '……ああ。' }
        ]
    ],

    // 浪人 vs 女剣士
    'ronin_onnaSamurai': [
        [
            { speaker: 'onnaSamurai', text: '浪人……何のために剣を振るう？' },
            { speaker: 'ronin', text: '……生きるため、それだけだ。' }
        ],
        [
            { speaker: 'ronin', text: '……退け。斬りたくはない。' },
            { speaker: 'onnaSamurai', text: '女と侮るか。その油断、命取りよ。' }
        ],
        [
            { speaker: 'onnaSamurai', text: 'その虚ろな眼……何を失った？' },
            { speaker: 'ronin', text: '……全てだ。' }
        ]
    ],

    // 浪人 vs 僧兵
    'ronin_souhei': [
        [
            { speaker: 'souhei', text: '迷える者よ。仏に帰依する気はないか。' },
            { speaker: 'ronin', text: '……仏は俺を救わなかった。' }
        ],
        [
            { speaker: 'ronin', text: '坊主が何故、刀を持つ。' },
            { speaker: 'souhei', text: '守るべきものがあるからだ。' }
        ],
        [
            { speaker: 'souhei', text: 'その魂、救ってやろう。' },
            { speaker: 'ronin', text: '……余計な世話だ。' }
        ]
    ],

    // 浪人 vs 忍び
    'ronin_shinobi': [
        [
            { speaker: 'shinobi', text: '……気づいていたか。' },
            { speaker: 'ronin', text: '殺気は隠せん。' }
        ],
        [
            { speaker: 'ronin', text: '……誰の差し金だ。' },
            { speaker: 'shinobi', text: '知る必要はない。死ね。' }
        ],
        [
            { speaker: 'shinobi', text: '影から狙うつもりだったが……' },
            { speaker: 'ronin', text: '……それが侍の勘だ。' }
        ]
    ],

    // 浪人 vs 野武士
    'ronin_nobushi': [
        [
            { speaker: 'nobushi', text: 'へへっ……その刀、高く売れそうだな。' },
            { speaker: 'ronin', text: '……欲しければ、奪ってみろ。' }
        ],
        [
            { speaker: 'ronin', text: '……山賊か。' },
            { speaker: 'nobushi', text: '野武士と呼べ！俺たちにも誇りがある！' }
        ],
        [
            { speaker: 'nobushi', text: '一人旅とは不用心だな！' },
            { speaker: 'ronin', text: '……一人で十分だ。' }
        ]
    ],

    // 若侍 vs 老剣士
    'wakaSamurai_oldMaster': [
        [
            { speaker: 'wakaSamurai', text: '老師！一手、ご指南願いたい！' },
            { speaker: 'oldMaster', text: '……命を賭ける覚悟はあるか。' }
        ],
        [
            { speaker: 'oldMaster', text: '焦るな若者。剣は心を映す。' },
            { speaker: 'wakaSamurai', text: 'わかっている！だが、待てない！' }
        ],
        [
            { speaker: 'wakaSamurai', text: 'あなたを超えて、一人前になる！' },
            { speaker: 'oldMaster', text: 'ふむ……その気概や良し。' }
        ]
    ],

    // 若侍 vs 女剣士
    'wakaSamurai_onnaSamurai': [
        [
            { speaker: 'wakaSamurai', text: '女に負けるわけにはいかん！' },
            { speaker: 'onnaSamurai', text: 'その慢心……墓穴を掘るわよ。' }
        ],
        [
            { speaker: 'onnaSamurai', text: '随分と威勢がいいのね。' },
            { speaker: 'wakaSamurai', text: '当然だ！俺は誰にも負けん！' }
        ],
        [
            { speaker: 'wakaSamurai', text: '美しい……だが、手加減はしない！' },
            { speaker: 'onnaSamurai', text: 'それでいい。私も容赦しない。' }
        ]
    ],

    // 若侍 vs 僧兵
    'wakaSamurai_souhei': [
        [
            { speaker: 'souhei', text: '若者よ。その怒り、何処へ向かう。' },
            { speaker: 'wakaSamurai', text: '強くなるためだ！理由はそれで十分！' }
        ],
        [
            { speaker: 'wakaSamurai', text: '坊主のくせに強そうだな。' },
            { speaker: 'souhei', text: '仏に仕える者にも、武の道はある。' }
        ],
        [
            { speaker: 'souhei', text: '命を粗末にするな。' },
            { speaker: 'wakaSamurai', text: '命を賭けねば、強くなれん！' }
        ]
    ],

    // 若侍 vs 忍び
    'wakaSamurai_shinobi': [
        [
            { speaker: 'wakaSamurai', text: '卑怯者め！正々堂々と勝負しろ！' },
            { speaker: 'shinobi', text: '……それが忍びの道だ。' }
        ],
        [
            { speaker: 'shinobi', text: '騒がしい若造だ。' },
            { speaker: 'wakaSamurai', text: '黙れ！闇に隠れる臆病者が！' }
        ],
        [
            { speaker: 'wakaSamurai', text: '忍びか……姑息な輩め！' },
            { speaker: 'shinobi', text: '侮るな。死ぬぞ。' }
        ]
    ],

    // 若侍 vs 野武士
    'wakaSamurai_nobushi': [
        [
            { speaker: 'nobushi', text: 'お坊ちゃんが何の用だ？' },
            { speaker: 'wakaSamurai', text: '貴様らを成敗する！' }
        ],
        [
            { speaker: 'wakaSamurai', text: '野盗め！覚悟しろ！' },
            { speaker: 'nobushi', text: 'はっ！若造が粋がるな！' }
        ],
        [
            { speaker: 'nobushi', text: '良い刀持ってんなぁ。寄越せ！' },
            { speaker: 'wakaSamurai', text: 'この刀は父から受け継いだもの……渡せん！' }
        ]
    ],

    // 老剣士 vs 女剣士
    'oldMaster_onnaSamurai': [
        [
            { speaker: 'oldMaster', text: '見事な構えだ。どこで学んだ？' },
            { speaker: 'onnaSamurai', text: '父から……今は亡き、父から。' }
        ],
        [
            { speaker: 'onnaSamurai', text: '伝説の剣士と聞いた。本当ですか？' },
            { speaker: 'oldMaster', text: '伝説など、生き残った者が作るものよ。' }
        ],
        [
            { speaker: 'oldMaster', text: '女の身で、よくここまで。' },
            { speaker: 'onnaSamurai', text: '性別は剣の前では無意味です。' }
        ]
    ],

    // 老剣士 vs 僧兵
    'oldMaster_souhei': [
        [
            { speaker: 'souhei', text: '老師、お久しゅうございます。' },
            { speaker: 'oldMaster', text: 'ほう……あの小僧がここまで育ったか。' }
        ],
        [
            { speaker: 'oldMaster', text: '仏門に入ったと聞いたが。' },
            { speaker: 'souhei', text: 'ええ。されど剣は捨てておりませぬ。' }
        ],
        [
            { speaker: 'souhei', text: 'かつての御恩、今こそ返します。' },
            { speaker: 'oldMaster', text: '……本気で来い。それが礼儀だ。' }
        ]
    ],

    // 老剣士 vs 忍び
    'oldMaster_shinobi': [
        [
            { speaker: 'shinobi', text: '……老いたな。' },
            { speaker: 'oldMaster', text: 'だが、まだ死んでおらぬ。' }
        ],
        [
            { speaker: 'oldMaster', text: '殺気を消したつもりか。甘いな。' },
            { speaker: 'shinobi', text: '……さすがだ。' }
        ],
        [
            { speaker: 'shinobi', text: '誰かの依頼ではない。個人的な決着だ。' },
            { speaker: 'oldMaster', text: '……そうか。ならば応じよう。' }
        ]
    ],

    // 老剣士 vs 野武士
    'oldMaster_nobushi': [
        [
            { speaker: 'nobushi', text: 'じいさん、大人しく金を出しな。' },
            { speaker: 'oldMaster', text: '……命が惜しくば、去れ。' }
        ],
        [
            { speaker: 'oldMaster', text: 'この老いぼれ相手に、何人で来た？' },
            { speaker: 'nobushi', text: 'へっ、一人で十分だ！' }
        ],
        [
            { speaker: 'nobushi', text: 'なんだその目……！' },
            { speaker: 'oldMaster', text: '儂を殺せると思うか？' }
        ]
    ],

    // 女剣士 vs 僧兵
    'onnaSamurai_souhei': [
        [
            { speaker: 'souhei', text: '女人の身で、その覚悟……見事。' },
            { speaker: 'onnaSamurai', text: '覚悟は男女を選びません。' }
        ],
        [
            { speaker: 'onnaSamurai', text: '仏に仕える方が、何故戦うのです？' },
            { speaker: 'souhei', text: '守るため、時に仏も剣を取る。' }
        ],
        [
            { speaker: 'souhei', text: 'その太刀筋、どこかで……' },
            { speaker: 'onnaSamurai', text: '父の流派です。ご存知ですか？' }
        ]
    ],

    // 女剣士 vs 忍び
    'onnaSamurai_shinobi': [
        [
            { speaker: 'shinobi', text: '……見事な警戒心だ。' },
            { speaker: 'onnaSamurai', text: '女が一人旅をするには、必要なこと。' }
        ],
        [
            { speaker: 'onnaSamurai', text: '暗殺者……私を狙っているの？' },
            { speaker: 'shinobi', text: '……ああ。諦めて死ね。' }
        ],
        [
            { speaker: 'shinobi', text: '強い女は面倒だ。' },
            { speaker: 'onnaSamurai', text: 'それは褒め言葉として受け取るわ。' }
        ]
    ],

    // 女剣士 vs 野武士
    'onnaSamurai_nobushi': [
        [
            { speaker: 'nobushi', text: 'おいおい、姉ちゃん危ないぜ？' },
            { speaker: 'onnaSamurai', text: '危ないのはあなたの方よ。' }
        ],
        [
            { speaker: 'onnaSamurai', text: '道を開けなさい。' },
            { speaker: 'nobushi', text: 'へへっ、通りたきゃ俺を倒してみな！' }
        ],
        [
            { speaker: 'nobushi', text: '女一人で強がってもな！' },
            { speaker: 'onnaSamurai', text: '試してみる？' }
        ]
    ],

    // 僧兵 vs 忍び
    'souhei_shinobi': [
        [
            { speaker: 'souhei', text: '闇に生きる者よ。仏の慈悲を知らぬか。' },
            { speaker: 'shinobi', text: '……慈悲では腹は膨れん。' }
        ],
        [
            { speaker: 'shinobi', text: '坊主を殺すのは気が引けるが……' },
            { speaker: 'souhei', text: '遠慮は無用。この命、仏に捧げたもの。' }
        ],
        [
            { speaker: 'souhei', text: '殺気を感じる……そこか！' },
            { speaker: 'shinobi', text: 'ちっ、勘のいい坊主だ。' }
        ]
    ],

    // 僧兵 vs 野武士
    'souhei_nobushi': [
        [
            { speaker: 'nobushi', text: '坊さん、金目のもの出しな！' },
            { speaker: 'souhei', text: '拙僧が持つは錫杖と数珠のみ。' }
        ],
        [
            { speaker: 'souhei', text: '罪を重ねるな。今ならまだ……' },
            { speaker: 'nobushi', text: 'うるせぇ！説教は聞き飽きた！' }
        ],
        [
            { speaker: 'nobushi', text: 'でかい坊主だな……やりにくい。' },
            { speaker: 'souhei', text: '来るがいい。仏が見ておる。' }
        ]
    ],

    // 忍び vs 野武士
    'shinobi_nobushi': [
        [
            { speaker: 'nobushi', text: 'なんだ貴様……気配がねぇぞ！' },
            { speaker: 'shinobi', text: '……それが忍びだ。' }
        ],
        [
            { speaker: 'shinobi', text: 'ここを通せ。' },
            { speaker: 'nobushi', text: 'へっ、通行料を払いな！' }
        ],
        [
            { speaker: 'nobushi', text: '薄気味悪い野郎だな……' },
            { speaker: 'shinobi', text: '……死にたくなければ、どけ。' }
        ]
    ]
};

// 勝利セリフ（キャラクターごと）
const VICTORY_LINES = {
    ronin: [
        '……これで、また一人。',
        '……斬らねば、斬られる。',
        '……まだ、死ねぬ。',
        '……修羅の道を、往く。',
        '……。'
    ],
    wakaSamurai: [
        'やった……俺は強い！',
        'これが俺の力だ！',
        '父上、見ていてくれましたか！',
        'まだまだ……もっと強くなる！',
        'ふん、この程度か！'
    ],
    oldMaster: [
        '……まだ、錆びてはおらぬ。',
        '若いな……それが命取りよ。',
        '……儂も老いたものだ。',
        '一瞬の迷いが、命を分ける。',
        '……南無。'
    ],
    onnaSamurai: [
        '女と侮った報いよ。',
        '父上……また一歩、前へ。',
        'まだ、終われない。',
        '……強くならねば。',
        'これが、私の剣。'
    ],
    souhei: [
        '南無阿弥陀仏……成仏されよ。',
        '仏よ、この者の魂をお導きください。',
        '……業が深い。',
        '殺生は本意ではないが……',
        '……合掌。'
    ],
    shinobi: [
        '……任務完了。',
        '……影に還れ。',
        '……。',
        '……気配を消せ。死にたくなければ。',
        '……次。'
    ],
    nobushi: [
        'へへっ、ざまぁみろ！',
        '俺様の勝ちだ！',
        'これで今夜は酒が飲める！',
        '弱い奴は死ぬ、それだけだ！',
        'はっ、大したことねぇな！'
    ]
};

// ランダムな勝利セリフを取得
function getVictoryLine(charId) {
    const lines = VICTORY_LINES[charId];
    if (!lines || lines.length === 0) {
        return '……。';
    }
    const randomIndex = Math.floor(Math.random() * lines.length);
    return lines[randomIndex];
}

// 会話キーを正規化（キャラクターIDのアルファベット順にソート）
function normalizeDialogueKey(char1Id, char2Id) {
    const ids = [char1Id, char2Id].sort();
    return `${ids[0]}_${ids[1]}`;
}

// ランダムな会話を取得
function getDialogue(playerCharId, enemyCharId) {
    const key = normalizeDialogueKey(playerCharId, enemyCharId);
    const dialogues = DIALOGUES[key];

    if (!dialogues || dialogues.length === 0) {
        // フォールバック：汎用会話
        return [
            { speaker: enemyCharId, text: '……来るか。' },
            { speaker: playerCharId, text: '……ああ。' }
        ];
    }

    const randomIndex = Math.floor(Math.random() * dialogues.length);
    return dialogues[randomIndex];
}
