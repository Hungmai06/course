export const documentCategories = [
  { id: 1, name: 'Công nghệ', icon: 'devices' },
  { id: 2, name: 'Kinh doanh', icon: 'trending_up' },
  { id: 3, name: 'Khoa học', icon: 'science' },
  { id: 4, name: 'Văn học', icon: 'auto_stories' },
  { id: 5, name: 'Du lịch', icon: 'travel_explore' },
  { id: 6, name: 'Ẩm thực', icon: 'restaurant' },
]

export const documents = [
  { id: 1, title: 'IELTS Writing Task 2', description: 'Tổng hợp bài mẫu và từ vựng band 7.0+', categoryId: 2, views: 3702, thumbnail: null },
  { id: 2, title: 'TOEIC Listening Part 3-4', description: 'Chiến lược nghe hiểu và bài tập thực hành', categoryId: 1, views: 2676, thumbnail: null },
  { id: 3, title: 'Ngữ pháp Tiếng Anh A-Z', description: 'Tài liệu ngữ pháp toàn diện cho mọi cấp độ', categoryId: 3, views: 6468, thumbnail: null },
  { id: 4, title: 'Business English Emails', description: 'Mẫu email thương mại chuyên nghiệp', categoryId: 2, views: 2235, thumbnail: null },
  { id: 5, title: '1000 từ vựng IELTS', description: 'Từ vựng academic theo chủ đề', categoryId: 4, views: 9600, thumbnail: null },
  { id: 6, title: 'Phát âm chuẩn IPA', description: 'Hướng dẫn phát âm chuẩn quốc tế', categoryId: 5, views: 4701, thumbnail: null },
]

// Level 1: Collection (Bộ từ vựng - Bảng mới chưa có dữ liệu, rỗng ban đầu)
export const vocabularyCollections = []

// Level 2: Topic (Chủ đề chính - Dữ liệu các chủ đề chính thực tế của bạn)
export const vocabularyTopics = [
  { id: 1, collectionId: null, title: 'Bộ từ vựng cho 2k9', description: 'Kho từ vựng chính thức dành cho học sinh 2K9, được phân loại theo chủ đề và cấp độ nhằm hỗ trợ việc học, ôn tập và luyện thi hiệu quả.' },
  { id: 2, collectionId: null, title: 'Bộ từ vựng xây nền tiếng anh cho 2K9', description: 'Chia sẻ bộ từ vựng lấy gốc cho các bạn 2k9' },
  { id: 52, collectionId: null, title: 'Bộ từ cho người mất gốc(A1)', description: 'Bộ từ cho người mất gốc' }
]

// Level 3: Subtopic (Chủ đề nhỏ / Bài học thực tế của Cô Mai Phương)
export const vocabularySubtopics = [
  { id: 101, topicId: 1, title: 'Chủ đề: The World Of Work - Cô Mai Phương', description: 'Từ vựng chuyên sâu: Chủ đề: The World Of Work - Cô Mai Phương' },
  { id: 102, topicId: 1, title: 'Chủ đề: The Generation Gap - Cô Mai Phương', description: 'Bộ từ vựng trọng tâm của chủ đề The Generation Gap trong khóa học của Cô Mai Phương.' },
  { id: 103, topicId: 1, title: 'Chủ đề: Being Independent - Cô Mai Phương', description: 'Từ vựng chuyên sâu: Chủ đề: Being Independent - Cô Mai Phương' },
  { id: 104, topicId: 2, title: 'Chủ đề: Going Green - Cô Mai Phương', description: 'Từ vựng chuyên sâu: Chủ đề: Going Green - Cô Mai Phương' },
  { id: 105, topicId: 2, title: 'Chủ đề: Wildlife Conservation - Cô Mai Phương', description: 'Chủ đề: Từ vựng chuyên sâu: Chủ đề: Wildlife Conservation - Cô Mai Phương' },
  { id: 106, topicId: 52, title: 'Chủ đề: Artificial Intelligence', description: 'Từ vựng chuyên sâu: Chủ đề: Artificial Intelligence' }
]

// Level 4: Word (Từ vựng)
export const vocabularyWords = [
  // Subtopic 101: Education
  { id: 1, subtopicId: 101, word: 'Curriculum', meaning: 'Chương trình học', pronunciation: '/kəˈrɪkjələm/' },
  { id: 2, subtopicId: 101, word: 'Pedagogy', meaning: 'Phương pháp sư phạm', pronunciation: '/ˈpedəɡɒdʒi/' },
  { id: 3, subtopicId: 101, word: 'Academic', meaning: 'Thuộc học thuật', pronunciation: '/ˌækəˈdemɪk/' },
  { id: 4, subtopicId: 101, word: 'Enrollment', meaning: 'Sự tuyển sinh, nhập học', pronunciation: '/ɪnˈrəʊlmənt/' },

  // Subtopic 102: Research & Technology
  { id: 9, subtopicId: 102, word: 'Innovation', meaning: 'Sự đổi mới, sáng kiến', pronunciation: '/ˌɪnəˈveɪʃn/' },
  { id: 10, subtopicId: 102, word: 'Automation', meaning: 'Sự tự động hóa', pronunciation: '/ˌɔːtəˈmeɪʃn/' },

  // Subtopic 103: Environment
  { id: 5, subtopicId: 103, word: 'Biodiversity', meaning: 'Đa dạng sinh học', pronunciation: '/ˌbaɪəʊdaɪˈvɜːsəti/' },
  { id: 6, subtopicId: 103, word: 'Conservation', meaning: 'Sự bảo tồn', pronunciation: '/ˌkɒnsəˈveɪʃn/' },
  { id: 7, subtopicId: 103, word: 'Contaminate', meaning: 'Làm ô nhiễm', pronunciation: '/kənˈtæmɪneɪt/' },
  { id: 8, subtopicId: 103, word: 'Sustainable', meaning: 'Bền vững', pronunciation: '/səˈsteɪnəbl/' },

  // Subtopic 201: Office Environment
  { id: 11, subtopicId: 201, word: 'Colleague', meaning: 'Đồng nghiệp', pronunciation: '/ˈkɒliːɡ/' },
  { id: 12, subtopicId: 201, word: 'Correspondence', meaning: 'Thư từ trao đổi', pronunciation: '/ˌkɒrəˈspɒndəns/' },

  // Subtopic 202: Marketing & Sales
  { id: 13, subtopicId: 202, word: 'Campaign', meaning: 'Chiến dịch', pronunciation: '/kæmˈpeɪn/' },
  { id: 14, subtopicId: 202, word: 'Demographics', meaning: 'Nhân khẩu học', pronunciation: '/ˌdeməˈɡræfɪks/' },

  // Subtopic 301: Greetings
  { id: 15, subtopicId: 301, word: 'Pleasure', meaning: 'Niềm hân hạnh', pronunciation: '/ˈpleʒə(r)/' },
  { id: 16, subtopicId: 301, word: 'Acquaintance', meaning: 'Người quen', pronunciation: '/əˈkweɪntəns/' },

  // Subtopic 302: Food & Drinks
  { id: 17, subtopicId: 302, word: 'Appetizer', meaning: 'Món khai vị', pronunciation: '/ˈæpɪtaɪzə(r)/' },
  { id: 18, subtopicId: 302, word: 'Beverage', meaning: 'Đồ uống', pronunciation: '/ˈbevərɪdʒ/' },

  // Subtopic 401: Meetings
  { id: 19, subtopicId: 401, word: 'Agenda', meaning: 'Chương trình nghị sự', pronunciation: '/əˈdʒendə/' },
  { id: 20, subtopicId: 401, word: 'Adjourn', meaning: 'Hoãn lại, kết thúc cuộc họp', pronunciation: '/əˈdʒɜːn/' },

  // Subtopic 402: Presentations
  { id: 21, subtopicId: 402, word: 'Slideshow', meaning: 'Bài trình chiếu', pronunciation: '/ˈslaɪdʃəʊ/' },
  { id: 22, subtopicId: 402, word: 'Visual aids', meaning: 'Trực quan hỗ trợ', pronunciation: '/ˈvɪʒuəl eɪdz/' },

  // Subtopic 501: Airport
  { id: 23, subtopicId: 501, word: 'Boarding pass', meaning: 'Thẻ lên máy bay', pronunciation: '/ˈbɔːdɪŋ pɑːs/' },
  { id: 24, subtopicId: 501, word: 'Baggage claim', meaning: 'Nơi nhận hành lý', pronunciation: '/ˈbæɡɪdʒ kleɪm/' },

  // Subtopic 502: Hotel
  { id: 25, subtopicId: 502, word: 'Reservation', meaning: 'Sự đặt phòng trước', pronunciation: '/ˌrezəˈveɪʃn/' },
  { id: 26, subtopicId: 502, word: 'Complimentary', meaning: 'Miễn phí, đi kèm', pronunciation: '/ˌkɒmplɪˈmentri/' },

  // Subtopic 601: Hardware
  { id: 27, subtopicId: 601, word: 'Processor', meaning: 'Bộ vi xử lý', pronunciation: '/ˈprəʊsesə(r)/' },
  { id: 28, subtopicId: 601, word: 'Peripheral', meaning: 'Thiết bị ngoại vi', pronunciation: '/pəˈrɪfərəl/' },

  // Subtopic 602: Software
  { id: 29, subtopicId: 602, word: 'Repository', meaning: 'Kho chứa mã nguồn', pronunciation: '/rɪˈpɒzətri/' },
  { id: 30, subtopicId: 602, word: 'Compiler', meaning: 'Trình biên dịch', pronunciation: '/kəmˈpaɪlə(r)/' },
]

export const leaderboard = [
  { rank: 1, name: 'Minh Anh', score: 2450, streak: 15, badge: 'Nhà vô địch' },
  { rank: 2, name: 'Hài Đăng', score: 2180, streak: 8, badge: 'Siêu sao' },
  { rank: 3, name: 'Thu Hà', score: 1950, streak: 12, badge: 'Chăm chỉ' },
  { rank: 4, name: 'Alex Explorer', score: 1820, streak: 5, badge: 'Khám phá' },
  { rank: 5, name: 'Phương Linh', score: 1650, streak: 3, badge: 'Mới bắt đầu' },
]
