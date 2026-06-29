// Bilingual content dictionary (VN primary / EN). All product facts sourced from
// "CodeProve - Build Specification v2.0" and the Marketing Website Design Proposal.

export const content = {
  vi: {
    nav: {
      links: [
        { label: "Giới thiệu", href: "/#intro" },
        { label: "Về chúng tôi", href: "/#about" },
        { label: "Dịch vụ", href: "/#service" },
        { label: "Tiêu chí", href: "/#criteria" },
        { label: "Bảng giá", href: "/#pricing" },
        { label: "Liên hệ", href: "/#contact" },
      ],
      login: "Đăng nhập",
      signup: "Đăng ký",
      bookDemo: "Đặt lịch demo",
    },
    hero: {
      eyebrow: "EDTECH · ĐÁNH GIÁ LẬP TRÌNH CÙNG AI",
      titleA: "Không kiểm tra AI giải được bài không -",
      titleB: "kiểm tra bạn biết dùng AI đúng cách không.",
      sub: "Đo cách bạn tư duy cùng AI - không chỉ dòng code cuối cùng.",
      ctaPrimary: "Get started",
      ctaSecondary: "Dành cho nhà tuyển dụng",
      badge: "6 TRỤC NĂNG LỰC",
      score: "94/120",
      coreLabel: "AI Fluency Core",
    },
    trusted: {
      label: "Được tin dùng bởi các chương trình đào tạo & đối tác pilot",
      note: "(Logo đối tác trong giai đoạn MVP - placeholder)",
    },
    about: {
      title: "Về chúng tôi",
      lead: "CodeProve sinh ra để trả lời câu hỏi của thời đại AI: làm sao đo năng lực lập trình thật khi ai cũng có thể nhờ AI viết code?",
      body: "Chúng tôi tin giá trị của một lập trình viên không nằm ở dòng code cuối cùng, mà ở cách họ hiểu vấn đề, đặt giả thuyết, ra lệnh cho AI và kiểm chứng kết quả. CodeProve đo chính quá trình tư duy đó - minh bạch, công bằng và sát thực tế công việc.",
      pillars: [
        { title: "Sứ mệnh", desc: "Đo năng lực dùng AI đúng cách, không phải khả năng AI giải bài thay bạn." },
        { title: "Cách tiếp cận", desc: "Quan sát toàn bộ quá trình tư duy và chấm trên 6 trục năng lực rõ ràng." },
        { title: "Dành cho", desc: "Nhà tuyển dụng và đội ngũ kỹ thuật cần đánh giá năng lực ứng viên thật trong kỷ nguyên AI." },
      ],
    },
    service: {
      title: "Chúng tôi có gì",
      sub: "Một nền tảng luyện tập và đánh giá lập trình cùng AI - từ bài tập theo cấp độ đến bài toán doanh nghiệp thực tế.",
      offerings: [
        { name: "Bài tập theo cấp độ", desc: "Lộ trình từ cơ bản đến nâng cao, mỗi bài đo cách bạn tư duy cùng AI.", soon: false },
        { name: "Ciel tích hợp", desc: "Trợ lý AI ngay trong môi trường thi - gợi ý và hướng dẫn, không giải hộ.", soon: false },
        { name: "Chấm theo quá trình", desc: "Điểm gắn với dấu vết tư duy quan sát được, không chỉ kết quả cuối.", soon: false },
        { name: "Business problem", desc: "Bài toán doanh nghiệp thực chiến, sát với công việc thật.", soon: true },
      ],
      soonLabel: "Sắp ra mắt",
    },
    contact: {
      title: "Liên hệ với chúng tôi",
      sub: "Có câu hỏi, cần demo hay muốn hợp tác? Gửi tin nhắn, chúng tôi sẽ phản hồi sớm.",
      nameLabel: "Họ và tên",
      namePlaceholder: "Nguyễn Văn A",
      emailLabel: "Email",
      emailPlaceholder: "ban@email.com",
      messageLabel: "Nội dung",
      messagePlaceholder: "Bạn cần chúng tôi hỗ trợ điều gì?",
      send: "Gửi tin nhắn",
      email: "hello@codeprove.vn",
      faqTitle: "Câu hỏi thường gặp",
    },
    problem: {
      eyebrow: "Vấn đề",
      title: "Code chạy được không có nghĩa là người học hiểu.",
      body: "Trong thời đại AI, sinh viên có thể tạo ra code chạy đúng mà không hiểu vì sao. Giảng viên không còn cách nào phân biệt “hiểu thật” với “copy-paste từ AI” khi chỉ nhìn vào kết quả cuối.",
      stats: [
        {
          value: "49%",
          label:
            "tình huống AI tạo code chạy được nhưng người dùng không giải thích được (tín hiệu nghiên cứu CP2).",
        },
        {
          value: "0",
          label:
            "dấu vết tư duy để lại khi sinh viên hỏi AI ngoài rồi dán code vào.",
        },
        {
          value: "100%",
          label:
            "AI hỗ trợ nằm bên trong nền tảng - điểm gắn với quá trình quan sát được, không phải kết quả code.",
        },
      ],
    },
    comparison: {
      eyebrow: "Khác biệt cốt lõi",
      title: "CodeProve đo cái mà những nền tảng khác bỏ qua.",
      sub: "LeetCode, HackerRank, CodeSignal chấm code cuối. Các trợ lý AI thì viết hộ code. CodeProve chấm chính cách bạn tư duy cùng AI.",
      rows: [
        "Chấm quá trình tư duy, không chỉ kết quả",
        "AI hỗ trợ nằm trong môi trường thi",
        "Kiểm chứng output AI (verification-trap)",
        "Chống gian lận theo quá trình",
        "Báo cáo năng lực 6 trục",
      ],
      others: ["LeetCode", "HackerRank", "CodeSignal", "ChatGPT / Cursor"],
      brand: "CodeProve",
    },
    rubric: {
      eyebrow: "Rubric 6 trục",
      title: "Một điểm số kể trọn câu chuyện năng lực.",
      sub: "Scoring Engine chấm 6 trục độc lập (0–20 mỗi trục) từ event stream của phiên làm bài, rồi quy về thang 0–100 theo trọng số đã chốt.",
      formula: "Score = 5 · Σ (weight · axis)",
      axes: [
        {
          name: "Understanding",
          vi: "Hiểu vấn đề",
          weight: "0.25",
          desc: "Hiểu đề trước khi prompt; giải thích lại được giải pháp sau khi nộp (explain-back).",
        },
        {
          name: "Hypothesis",
          vi: "Đặt giả thuyết",
          weight: "0.22",
          desc: "Tự nêu hướng giải trước khi viết code, thay vì để AI tự đề xuất hộ.",
        },
        {
          name: "Prompting",
          vi: "Chất lượng prompt",
          weight: "0.18",
          desc: "Prompt rõ ràng, đúng từ khoá, nêu ràng buộc - không lười, không lặp.",
        },
        {
          name: "Verification",
          vi: "Kiểm chứng AI",
          weight: "0.15",
          desc: "Phát hiện lỗi AI cố tình chèn (injectedError); không chấp nhận mù output.",
        },
        {
          name: "Testing",
          vi: "Viết test",
          weight: "0.10",
          desc: "Viết test case hợp lệ và đạt coverage để validate giải pháp.",
        },
        {
          name: "Debugging",
          vi: "Gỡ lỗi",
          weight: "0.10",
          desc: "Tự sửa khi AI cho kết quả sai, thay vì phụ thuộc hoàn toàn vào AI.",
        },
      ],
    },
    workspace: {
      eyebrow: "Assessment Workspace",
      title: "Một không gian làm bài - mọi tư duy đều để lại dấu vết.",
      body: "Editor Python, sandbox thực thi cô lập, và Ciel trong một side-box duy nhất. Mỗi prompt, mỗi lần chạy, mỗi giả thuyết đều được ghi vào event stream append-only để chấm điểm và đảm bảo tính toàn vẹn.",
      features: [
        "Code editor + sandbox cô lập (không mạng ngoài)",
        "Ciel - trợ lý AI duy nhất trong phiên",
        "Prompt log + giả thuyết ban đầu + giải thích cuối",
        "Verification-trap: AI cố tình chèn lỗi để kiểm tra bạn",
      ],
      chip: "$ codeprove --assess",
    },
    personas: {
      eyebrow: "Dành cho ai",
      title: "Một nền tảng, ba góc nhìn giá trị.",
      tabs: [
        {
          key: "students",
          label: "Sinh viên",
          headline: "Chứng minh bạn dùng AI giỏi - không phải giấu việc dùng AI.",
          benefits: [
            "Radar 6 trục cho thấy điểm mạnh thật của bạn",
            "Ciel hướng dẫn, không làm hộ - bạn vẫn học",
            "Chứng chỉ năng lực AI-fluency để gắn vào hồ sơ",
          ],
          cta: "Thử một thử thách",
          href: "/students",
        },
        {
          key: "universities",
          label: "Trường học",
          headline: "Phân biệt hiểu thật và copy AI - bằng dữ liệu, không cảm tính.",
          benefits: [
            "Dashboard giảng viên với radar & lịch sử tiến bộ",
            "Rubric minh bạch, chỉnh được theo môn học",
            "Integrity badge thay vì giám sát kiểu camera",
          ],
          cta: "Đặt lịch demo",
          href: "/universities",
        },
        {
          key: "employers",
          label: "Nhà tuyển dụng",
          headline: "Employer Fluency Report - tuyển người dùng AI đúng cách.",
          benefits: [
            "Báo cáo năng lực thực chiến cùng AI, không phải đố mẹo",
            "Bài tập tình huống thật: bug fixing, refactor, code review",
            "Tín hiệu toàn vẹn cho mỗi bài đánh giá",
          ],
          cta: "Liên hệ tuyển dụng",
          href: "/employers",
        },
      ],
    },
    integrity: {
      eyebrow: "Tính toàn vẹn học tập",
      title: "Chống gian lận bằng cách làm cho gian lận trở nên vô nghĩa.",
      body: "Vì điểm gắn với quá trình tư duy quan sát được, “hỏi AI ngoài rồi dán code vào” không tạo ra dấu vết để chấm. Ba lớp phòng thủ độc lập tổng hợp thành Integrity Score - chỉ gắn cờ, không tự đánh trượt.",
      cards: [
        {
          title: "Explain-back",
          desc: "Giải thích lại giải pháp sau khi nộp - code dán ngoài không qua được bước này.",
        },
        {
          title: "Verification-trap",
          desc: "Ciel cố tình chèn lỗi; chỉ người thực sự hiểu mới phát hiện và sửa.",
        },
        {
          title: "Chấm theo quá trình",
          desc: "Biến thể động + dấu vết hội thoại khiến lời giải chép sẵn vô hiệu.",
        },
      ],
      levels: [
        { tone: "green", label: "Xanh", desc: "Hành vi tự nhiên, dấu vết tư duy đầy đủ - chấm tự động." },
        { tone: "yellow", label: "Vàng", desc: "Vài tín hiệu bất thường - gắn cờ, tăng câu hỏi explain-back." },
        { tone: "red", label: "Đỏ", desc: "Nhiều tín hiệu trùng khớp - giữ kết quả để rà soát thủ công." },
      ],
      note: "Nguyên tắc: mỗi tín hiệu chỉ là xác suất. Integrity Score không tự đánh trượt - tránh oan cho người gõ nhanh.",
    },
    pricing: {
      title: "Chọn gói dịch vụ của bạn",
      sub: "Bắt đầu miễn phí. Nâng cấp khi bạn muốn đo sâu hơn năng lực dùng AI của mình.",
      tabs: { personal: "Cá nhân", business: "Doanh nghiệp" },
      popular: "Phổ biến",
      plans: [
        {
          name: "Free",
          price: "0đ",
          period: "/tháng",
          featured: false,
          features: [
            "Thử thách & radar 6 trục cơ bản",
            "Ciel trong mỗi phiên",
            "Lịch sử tiến bộ cá nhân",
            "Giới hạn lượt chấm mỗi tháng",
          ],
          cta: "Bắt đầu miễn phí",
        },
        {
          name: "Plus",
          price: "99.000đ",
          period: "/tháng",
          featured: true,
          features: [
            "Mọi tính năng gói Free",
            "Thử thách & chấm không giới hạn",
            "Phân tích chi tiết 6 trục năng lực",
            "Chứng chỉ năng lực AI Fluency",
            "Ciel nâng cao",
          ],
          cta: "Nâng cấp Plus",
        },
        {
          name: "Pro",
          price: "199.000đ",
          period: "/tháng",
          featured: false,
          features: [
            "Mọi tính năng gói Plus",
            "Lộ trình học cá nhân hoá theo AI",
            "Mô phỏng phỏng vấn & tình huống thực chiến",
            "Báo cáo năng lực chuyên sâu",
            "Hỗ trợ ưu tiên",
          ],
          cta: "Nâng cấp Pro",
        },
      ],
      business: {
        name: "Doanh nghiệp",
        tagline:
          "Giải pháp đánh giá năng lực lập trình cùng AI cho nhà tuyển dụng & đội ngũ tuyển dụng kỹ thuật, tuỳ chỉnh theo quy mô.",
        priceNote: "Báo giá theo quy mô",
        features: [
          "Dashboard nhà tuyển dụng + radar ứng viên",
          "Rubric tuỳ chỉnh theo môn / vị trí",
          "Integrity badge & báo cáo toàn vẹn",
          "Quản lý người dùng, SSO & phân quyền",
          "Tích hợp, onboarding & hỗ trợ chuyên biệt",
        ],
        cta: "Liên hệ để trao đổi",
      },
    },
    faq: {
      eyebrow: "Câu hỏi thường gặp",
      title: "Những điều trường học & sinh viên hay hỏi.",
      items: [
        {
          q: "Ciel có tự đưa lời giải hoàn chỉnh không?",
          a: "Không. Đây là ranh giới cứng: Ciel không bao giờ trả về một lời giải hoàn chỉnh chạy được, kể cả khi bị prompt mồi. Nó gợi ý, giải thích và hướng dẫn từng bước - nếu làm hộ, toàn bộ cơ chế chấm Prompting/Verification sẽ sụp đổ.",
        },
        {
          q: "Nhà tuyển dụng có thấy được prompt của sinh viên không?",
          a: "Có - prompt và dấu vết tư duy là dữ liệu chấm điểm, hiển thị trong dashboard giảng viên một cách minh bạch. Telemetry hành vi được công khai với người học theo nguyên tắc quyền riêng tư (NFR-5).",
        },
        {
          q: "Có hỗ trợ ngôn ngữ nào ngoài Python không?",
          a: "MVP tập trung Python. Kiến trúc Rule Engine tách rời ngôn ngữ nên thêm ngôn ngữ/SQL mới không cần sửa lõi (Phase 2).",
        },
        {
          q: "Integrity Score có tự đánh trượt sinh viên không?",
          a: "Không. Mỗi tín hiệu chỉ là xác suất. Mức Đỏ chỉ giữ kết quả để rà soát thủ công, tránh oan cho người gõ nhanh hay thao tác tự nhiên.",
        },
        {
          q: "CodeProve khác gì các bài thi code online khác?",
          a: "Các nền tảng khác chấm code cuối cùng. CodeProve chấm quá trình giải quyết vấn đề cùng AI - nên việc dán code từ AI ngoài không tạo ra dấu vết tư duy để đạt điểm cao.",
        },
      ],
    },
    finalCta: {
      eyebrow: "Sẵn sàng bắt đầu?",
      title: "Đánh giá năng lực lập trình cho thời đại AI.",
      sub: "Thử một thử thách miễn phí, hoặc đặt lịch demo cho chương trình đào tạo của bạn.",
      ctaPrimary: "Thử một thử thách",
      ctaSecondary: "Đặt lịch demo cho trường",
    },
    footer: {
      tagline: "Nền tảng đánh giá năng lực lập trình cùng AI.",
      product: "Sản phẩm",
      company: "Đối tượng",
      legal: "Pháp lý",
      links: {
        product: [
          { label: "Dịch vụ", href: "/#service" },
          { label: "Tiêu chí", href: "/#criteria" },
          { label: "Bảng giá", href: "/#pricing" },
        ],
        audience: [
          { label: "Sinh viên", href: "/students" },
          { label: "Trường học", href: "/universities" },
          { label: "Nhà tuyển dụng", href: "/employers" },
        ],
        legal: [
          { label: "Quyền riêng tư", href: "/privacy" },
          { label: "Điều khoản", href: "/terms" },
        ],
      },
      rights: "Bảo lưu mọi quyền.",
      madeBy: "Dự án EXE101 · FPT University",
    },
    common: {
      backHome: "Về trang chủ",
      getStarted: "Bắt đầu",
      learnMore: "Tìm hiểu thêm",
    },
    pages: {
      students: {
        eyebrow: "Dành cho sinh viên",
        title: "Biến kỹ năng dùng AI thành lợi thế có thể chứng minh.",
        sub: "Trong thị trường lao động AI-first, biết dùng AI đúng cách quan trọng hơn việc thuộc lòng thuật toán. CodeProve giúp bạn chứng minh điều đó.",
        sections: [
          {
            title: "Học bằng cách làm thật",
            body: "Ciel đồng hành trong mỗi phiên - gợi ý, đặt câu hỏi ngược, không làm hộ. Bạn vẫn là người tư duy.",
          },
          {
            title: "Hiểu chính mình qua radar 6 trục",
            body: "Mỗi bài cho bạn một radar năng lực: bạn mạnh ở prompting nhưng yếu ở verification? Bạn sẽ biết để cải thiện.",
          },
          {
            title: "Chứng chỉ AI-fluency",
            body: "Hoàn thành lộ trình và nhận chứng chỉ năng lực để gắn vào CV - tín hiệu thật cho nhà tuyển dụng.",
          },
        ],
      },
      universities: {
        eyebrow: "Dành cho trường học",
        title: "Đánh giá hiểu biết thật của sinh viên trong kỷ nguyên AI.",
        sub: "Giảng viên không thể cấm AI, cũng không thể nhắm mắt cho qua. CodeProve cho bạn dữ liệu để đánh giá công bằng và minh bạch.",
        sections: [
          {
            title: "Dashboard giảng viên",
            body: "Radar lớp học, lịch sử tiến bộ week-over-week, và feedback định tính tự sinh cho từng sinh viên theo từng trục.",
          },
          {
            title: "Rubric minh bạch & chỉnh được",
            body: "Luật chấm là dữ liệu Markdown, hot-reload. Bạn điều chỉnh trọng số theo môn học mà không cần kỹ sư deploy lại.",
          },
          {
            title: "Toàn vẹn, không giám sát",
            body: "Integrity badge xanh/vàng/đỏ giúp bạn tập trung rà soát đúng chỗ - diễn đạt như “liêm chính học thuật”, không phải camera theo dõi.",
          },
        ],
      },
      employers: {
        eyebrow: "Dành cho nhà tuyển dụng",
        title: "Tuyển kỹ sư biết cộng tác với AI - không phải biết giấu nó.",
        sub: "Công việc lập trình ngày nay là cộng tác với AI. CodeProve đánh giá đúng kỹ năng đó bằng các tình huống thực chiến.",
        sections: [
          {
            title: "Employer Fluency Report",
            body: "Báo cáo 6 trục cho mỗi ứng viên: họ kiểm chứng output AI tốt đến đâu, debug độc lập ra sao, prompt có chặt chẽ không.",
          },
          {
            title: "Bài tập tình huống thật",
            body: "Bug fixing, API error, refactor, code review - đo năng lực thực chiến thay vì câu đố thuật toán hiếm gặp.",
          },
          {
            title: "Tín hiệu toàn vẹn",
            body: "Mỗi bài đánh giá đi kèm Integrity Score, giúp bạn tin tưởng vào kết quả mà vẫn công bằng với ứng viên.",
          },
        ],
      },
      privacy: {
        title: "Chính sách quyền riêng tư",
        updated: "Cập nhật lần cuối: 24/06/2026",
        intro:
          "CodeProve ghi nhận telemetry hành vi trong phiên làm bài để phục vụ chấm điểm và đảm bảo tính toàn vẹn. Trang này mô tả minh bạch dữ liệu chúng tôi thu thập và cách dùng (theo NFR-5).",
        sections: [
          {
            h: "Dữ liệu chúng tôi thu thập",
            p: "Các sự kiện trong phiên làm bài: prompt gửi cho Ciel, lần chạy code, giả thuyết, thao tác chỉnh sửa, tín hiệu focus/paste. Mọi sự kiện được lưu append-only để có thể replay khi rà soát.",
          },
          {
            h: "Mục đích sử dụng",
            p: "Dữ liệu chỉ dùng để: (1) chấm 6 trục năng lực, (2) tính Integrity Score, (3) hiển thị tiến bộ cho người học và giảng viên. Chúng tôi không bán dữ liệu cho bên thứ ba.",
          },
          {
            h: "Minh bạch với người học",
            p: "Telemetry hành vi được công khai với người học. Bạn có quyền biết tín hiệu nào được ghi và vì sao.",
          },
          {
            h: "Lưu trữ & bảo mật",
            p: "Sandbox thực thi cô lập, không mạng ngoài. Dữ liệu được bảo vệ theo các quy định bảo vệ dữ liệu áp dụng.",
          },
        ],
      },
      terms: {
        title: "Điều khoản dịch vụ",
        updated: "Cập nhật lần cuối: 24/06/2026",
        intro:
          "Bằng việc sử dụng CodeProve, bạn đồng ý với các điều khoản dưới đây. Đây là bản tóm tắt cho giai đoạn MVP.",
        sections: [
          {
            h: "Sử dụng hợp lệ",
            p: "CodeProve dành cho mục đích học tập và đánh giá năng lực. Bạn không được cố tình phá hoại cơ chế chấm điểm hoặc gian lận trong các phiên đánh giá có giám sát.",
          },
          {
            h: "Tài khoản",
            p: "Bạn chịu trách nhiệm cho hoạt động dưới tài khoản của mình. Trường học và nhà tuyển dụng quản lý quyền truy cập theo gói license tương ứng.",
          },
          {
            h: "Sở hữu trí tuệ",
            p: "Rubric, Scoring Engine và nội dung bài tập thuộc sở hữu của CodeProve. Một số thành phần đo lường được tham khảo và nội hoá từ repo mã nguồn mở microsoft/AI-Engineering-Coach (giấy phép MIT).",
          },
          {
            h: "Miễn trừ trách nhiệm",
            p: "Dịch vụ được cung cấp “as-is” trong giai đoạn MVP. Chúng tôi nỗ lực đảm bảo độ chính xác của điểm số nhưng không bảo hành tuyệt đối.",
          },
        ],
      },
    },
  },

  en: {
    nav: {
      links: [
        { label: "Intro", href: "/#intro" },
        { label: "About us", href: "/#about" },
        { label: "Service", href: "/#service" },
        { label: "Criteria", href: "/#criteria" },
        { label: "Pricing", href: "/#pricing" },
        { label: "Contact", href: "/#contact" },
      ],
      login: "Log in",
      signup: "Sign up",
      bookDemo: "Book a demo",
    },
    hero: {
      eyebrow: "EDTECH · AI-NATIVE CODE ASSESSMENT",
      titleA: "Don't test whether AI can solve it -",
      titleB: "test whether you can use AI the right way.",
      sub: "We measure how you think with AI - not just the final lines of code.",
      ctaPrimary: "Get started",
      ctaSecondary: "For employers",
      badge: "6 COMPETENCY AXES",
      score: "94/120",
      coreLabel: "AI Fluency Core",
    },
    trusted: {
      label: "Trusted by training programs & pilot partners",
      note: "(Partner logos are placeholders during the MVP stage)",
    },
    about: {
      title: "About us",
      lead: "CodeProve exists to answer a question of the AI era: how do you measure real coding ability when anyone can ask AI to write the code?",
      body: "We believe a developer's value isn't the final line of code, but how they understand the problem, form hypotheses, direct the AI and verify the result. CodeProve measures exactly that thinking process - transparently, fairly and close to real work.",
      pillars: [
        { title: "Mission", desc: "Measure how well you use AI - not whether AI can solve the task for you." },
        { title: "Approach", desc: "Observe the whole thinking process and score it across 6 clear competency axes." },
        { title: "Built for", desc: "Recruiters and engineering teams who need real candidate competency signals in the age of AI." },
      ],
    },
    service: {
      title: "What we offer",
      sub: "A platform to practise and assess coding with AI - from tiered challenges to real-world business problems.",
      offerings: [
        { name: "Tiered challenges", desc: "A path from foundational to advanced; each task measures how you think with AI.", soon: false },
        { name: "Built-in Ciel", desc: "An AI assistant inside the assessment - it hints and guides, never solves for you.", soon: false },
        { name: "Process-based scoring", desc: "Scores tied to observable reasoning traces, not just the final output.", soon: false },
        { name: "Business problems", desc: "Real-world company problems, close to actual work.", soon: true },
      ],
      soonLabel: "Coming soon",
    },
    contact: {
      title: "Get in touch",
      sub: "Have a question, want a demo, or interested in partnering? Send us a message and we'll get back soon.",
      nameLabel: "Full name",
      namePlaceholder: "Jane Doe",
      emailLabel: "Email",
      emailPlaceholder: "you@email.com",
      messageLabel: "Message",
      messagePlaceholder: "How can we help you?",
      send: "Send message",
      email: "hello@codeprove.vn",
      faqTitle: "Frequently asked questions",
    },
    problem: {
      eyebrow: "The problem",
      title: "Code that runs doesn't mean the learner understands.",
      body: "In the age of AI, students can produce working code without understanding why. Looking only at the final result, instructors can no longer tell genuine understanding from AI copy-paste.",
      stats: [
        {
          value: "49%",
          label:
            "of cases where AI produces working code the user can't explain (research signal CP2).",
        },
        {
          value: "0",
          label:
            "reasoning traces left behind when a student asks an external AI and pastes the code in.",
        },
        {
          value: "100%",
          label:
            "of AI assistance lives inside the platform - scores tie to the observable process, not the code.",
        },
      ],
    },
    comparison: {
      eyebrow: "The core difference",
      title: "CodeProve measures what other platforms ignore.",
      sub: "LeetCode, HackerRank and CodeSignal grade the final code. AI assistants write the code for you. CodeProve grades how you actually think with AI.",
      rows: [
        "Grades the reasoning process, not just the result",
        "AI assistance lives inside the exam environment",
        "Verifies AI output (verification-trap)",
        "Process-based anti-cheating",
        "6-axis competency report",
      ],
      others: ["LeetCode", "HackerRank", "CodeSignal", "ChatGPT / Cursor"],
      brand: "CodeProve",
    },
    rubric: {
      eyebrow: "6-axis rubric",
      title: "One score that tells the whole competency story.",
      sub: "The Scoring Engine grades 6 independent axes (0–20 each) from the session event stream, then normalizes to a 0–100 scale using locked weights.",
      formula: "Score = 5 · Σ (weight · axis)",
      axes: [
        {
          name: "Understanding",
          vi: "Understanding",
          weight: "0.25",
          desc: "Grasp the problem before prompting; explain the solution back after submitting.",
        },
        {
          name: "Hypothesis",
          vi: "Hypothesis",
          weight: "0.22",
          desc: "Propose an approach before writing code, instead of letting the AI propose it for you.",
        },
        {
          name: "Prompting",
          vi: "Prompting",
          weight: "0.18",
          desc: "Clear prompts with the right keywords and constraints - not lazy, not repeated.",
        },
        {
          name: "Verification",
          vi: "Verification",
          weight: "0.15",
          desc: "Catch errors the AI intentionally injects; never accept output blindly.",
        },
        {
          name: "Testing",
          vi: "Testing",
          weight: "0.10",
          desc: "Write valid test cases and reach coverage to validate the solution.",
        },
        {
          name: "Debugging",
          vi: "Debugging",
          weight: "0.10",
          desc: "Fix it yourself when the AI is wrong, instead of fully depending on it.",
        },
      ],
    },
    workspace: {
      eyebrow: "Assessment Workspace",
      title: "One workspace - every thought leaves a trace.",
      body: "A Python editor, an isolated execution sandbox, and the Ciel in a single side-box. Every prompt, every run, every hypothesis is recorded into an append-only event stream for scoring and integrity.",
      features: [
        "Code editor + isolated sandbox (no external network)",
        "Ciel - the only AI in the session",
        "Prompt log + initial hypothesis + final explanation",
        "Verification-trap: the AI injects errors on purpose to test you",
      ],
      chip: "$ codeprove --assess",
    },
    personas: {
      eyebrow: "Who it's for",
      title: "One platform, three angles of value.",
      tabs: [
        {
          key: "students",
          label: "Students",
          headline: "Prove you're good with AI - don't hide that you used it.",
          benefits: [
            "A 6-axis radar that shows your real strengths",
            "An Ciel that guides, not solves - you still learn",
            "An AI-fluency certificate to attach to your profile",
          ],
          cta: "Try a challenge",
          href: "/students",
        },
        {
          key: "universities",
          label: "Universities",
          headline: "Tell real understanding from AI copy - with data, not hunches.",
          benefits: [
            "Instructor dashboard with radar & progress history",
            "Transparent rubric, tunable per course",
            "An integrity badge instead of camera-style surveillance",
          ],
          cta: "Book a demo",
          href: "/universities",
        },
        {
          key: "employers",
          label: "Employers",
          headline: "Employer Fluency Report - hire people who use AI well.",
          benefits: [
            "Real-world AI competency, not trick puzzles",
            "Realistic tasks: bug fixing, refactoring, code review",
            "An integrity signal for every assessment",
          ],
          cta: "Talk to us",
          href: "/employers",
        },
      ],
    },
    integrity: {
      eyebrow: "Learning integrity",
      title: "We stop cheating by making cheating pointless.",
      body: "Because scores tie to the observable reasoning process, asking an external AI and pasting code leaves no trace to grade. Three independent layers combine into an Integrity Score - it only flags, it never auto-fails.",
      cards: [
        {
          title: "Explain-back",
          desc: "Explain your solution after submitting - pasted code can't pass this step.",
        },
        {
          title: "Verification-trap",
          desc: "The Ciel injects errors on purpose; only those who truly understand catch and fix them.",
        },
        {
          title: "Process grading",
          desc: "Dynamic variants + conversation traces make pre-copied solutions worthless.",
        },
      ],
      levels: [
        { tone: "green", label: "Green", desc: "Natural behavior, full reasoning trace - auto-graded." },
        { tone: "yellow", label: "Yellow", desc: "A few anomalies - flagged, more explain-back questions." },
        { tone: "red", label: "Red", desc: "Multiple matching signals - held for manual review." },
      ],
      note: "Principle: each signal is only a probability. The Integrity Score never auto-fails - protecting fast, natural typists from false accusations.",
    },
    pricing: {
      title: "Choose your plan",
      sub: "Start free. Upgrade when you want to measure your AI fluency in depth.",
      tabs: { personal: "Personal", business: "Business" },
      popular: "Popular",
      plans: [
        {
          name: "Free",
          price: "$0",
          period: "/month",
          featured: false,
          features: [
            "Basic challenges & 6-axis radar",
            "Ciel in every session",
            "Personal progress history",
            "Limited assessments per month",
          ],
          cta: "Start free",
        },
        {
          name: "Plus",
          price: "$3.99",
          period: "/month",
          featured: true,
          features: [
            "Everything in Free",
            "Unlimited challenges & assessments",
            "Detailed 6-axis competency analytics",
            "AI Fluency certificate",
            "Advanced Ciel",
          ],
          cta: "Get Plus",
        },
        {
          name: "Pro",
          price: "$7.99",
          period: "/month",
          featured: false,
          features: [
            "Everything in Plus",
            "AI-personalised learning path",
            "Mock interviews & real-world scenarios",
            "In-depth competency reports",
            "Priority support",
          ],
          cta: "Get Pro",
        },
      ],
      business: {
        name: "Business",
        tagline:
          "AI-native code assessment for recruiters & technical hiring teams, tailored to your scale.",
        priceNote: "Custom pricing by scale",
        features: [
          "Recruiter dashboard + candidate radar",
          "Rubric tunable per course / role",
          "Integrity badge & integrity reports",
          "User management, SSO & roles",
          "Integration, onboarding & dedicated support",
        ],
        cta: "Contact us",
      },
    },
    faq: {
      eyebrow: "FAQ",
      title: "What universities & students ask most.",
      items: [
        {
          q: "Does the Ciel ever hand over a complete solution?",
          a: "No. This is a hard boundary: the Ciel never returns a complete, runnable solution, even under prompt injection. It hints, explains and guides step by step - if it solved problems for you, the entire Prompting/Verification scoring would collapse.",
        },
        {
          q: "Can recruiters see the students' prompts?",
          a: "Yes - prompts and reasoning traces are scoring data, shown transparently in the instructor dashboard. Behavioral telemetry is disclosed to learners under our privacy principle.",
        },
        {
          q: "Are languages other than Python supported?",
          a: "The MVP focuses on Python. The Rule Engine is language-agnostic, so adding new languages/SQL requires no core changes (Phase 2).",
        },
        {
          q: "Does the Integrity Score auto-fail students?",
          a: "No. Each signal is only a probability. A Red level only holds the result for manual review, protecting fast, natural typists from false accusations.",
        },
        {
          q: "How is CodeProve different from other online coding tests?",
          a: "Other platforms grade the final code. CodeProve grades the problem-solving process with AI - so pasting code from an external AI leaves no reasoning trace to score highly.",
        },
      ],
    },
    finalCta: {
      eyebrow: "Ready to start?",
      title: "Code assessment built for the age of AI.",
      sub: "Try a challenge for free, or book a demo for your training program.",
      ctaPrimary: "Try a challenge",
      ctaSecondary: "Book a demo for schools",
    },
    footer: {
      tagline: "The platform that measures coding competency with AI.",
      product: "Product",
      company: "Audience",
      legal: "Legal",
      links: {
        product: [
          { label: "Service", href: "/#service" },
          { label: "Criteria", href: "/#criteria" },
          { label: "Pricing", href: "/#pricing" },
        ],
        audience: [
          { label: "Students", href: "/students" },
          { label: "Universities", href: "/universities" },
          { label: "Employers", href: "/employers" },
        ],
        legal: [
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
        ],
      },
      rights: "All rights reserved.",
      madeBy: "EXE101 project · FPT University",
    },
    common: {
      backHome: "Back to home",
      getStarted: "Get started",
      learnMore: "Learn more",
    },
    pages: {
      students: {
        eyebrow: "For students",
        title: "Turn your AI skills into something you can prove.",
        sub: "In an AI-first job market, using AI well matters more than memorizing algorithms. CodeProve helps you prove it.",
        sections: [
          {
            title: "Learn by doing for real",
            body: "The Ciel rides along every session - hinting, asking back, never solving for you. You're still the one thinking.",
          },
          {
            title: "Understand yourself through a 6-axis radar",
            body: "Each task gives you a competency radar: strong at prompting but weak at verification? Now you'll know what to improve.",
          },
          {
            title: "AI-fluency certificate",
            body: "Complete the track and earn a competency certificate for your CV - a real signal for employers.",
          },
        ],
      },
      universities: {
        eyebrow: "For universities",
        title: "Assess students' true understanding in the AI era.",
        sub: "Instructors can't ban AI, nor look the other way. CodeProve gives you the data to assess fairly and transparently.",
        sections: [
          {
            title: "Instructor dashboard",
            body: "Class radar, week-over-week progress history, and auto-generated qualitative feedback per student per axis.",
          },
          {
            title: "Transparent, tunable rubric",
            body: "Scoring rules are Markdown data with hot-reload. Tune weights per course without engineers redeploying the core.",
          },
          {
            title: "Integrity, not surveillance",
            body: "A green/yellow/red integrity badge helps you review the right cases - framed as academic integrity, not camera monitoring.",
          },
        ],
      },
      employers: {
        eyebrow: "For employers",
        title: "Hire engineers who collaborate with AI - not hide it.",
        sub: "Programming today is collaboration with AI. CodeProve assesses exactly that skill through real-world scenarios.",
        sections: [
          {
            title: "Employer Fluency Report",
            body: "A 6-axis report per candidate: how well they verify AI output, debug independently, and write precise prompts.",
          },
          {
            title: "Real-world scenario tasks",
            body: "Bug fixing, API errors, refactoring, code review - measuring practical skill instead of rare algorithm puzzles.",
          },
          {
            title: "Integrity signal",
            body: "Every assessment ships with an Integrity Score, so you can trust the result while staying fair to candidates.",
          },
        ],
      },
      privacy: {
        title: "Privacy Policy",
        updated: "Last updated: Jun 24, 2026",
        intro:
          "CodeProve records behavioral telemetry during assessment sessions for scoring and integrity. This page transparently describes the data we collect and how we use it (per NFR-5).",
        sections: [
          {
            h: "Data we collect",
            p: "In-session events: prompts to the Ciel, code runs, hypotheses, edits, focus/paste signals. Every event is stored append-only so sessions can be replayed during review.",
          },
          {
            h: "How we use it",
            p: "Data is used only to: (1) grade the 6 competency axes, (2) compute the Integrity Score, (3) show progress to learners and instructors. We do not sell data to third parties.",
          },
          {
            h: "Transparency with learners",
            p: "Behavioral telemetry is disclosed to learners. You have the right to know which signals are recorded and why.",
          },
          {
            h: "Storage & security",
            p: "Execution runs in an isolated sandbox with no external network. Data is protected under applicable data-protection regulations.",
          },
        ],
      },
      terms: {
        title: "Terms of Service",
        updated: "Last updated: Jun 24, 2026",
        intro:
          "By using CodeProve, you agree to the terms below. This is a summary for the MVP stage.",
        sections: [
          {
            h: "Acceptable use",
            p: "CodeProve is for learning and competency assessment. You may not deliberately sabotage the scoring mechanism or cheat in proctored assessment sessions.",
          },
          {
            h: "Accounts",
            p: "You are responsible for activity under your account. Universities and employers manage access under their respective license plans.",
          },
          {
            h: "Intellectual property",
            p: "The rubric, Scoring Engine and task content belong to CodeProve. Some measurement components are referenced and internalized from the open-source repo microsoft/AI-Engineering-Coach (MIT license).",
          },
          {
            h: "Disclaimer",
            p: "The service is provided “as-is” during the MVP stage. We strive for scoring accuracy but make no absolute warranty.",
          },
        ],
      },
    },
  },
} as const;

export type Content = (typeof content)["vi"];
