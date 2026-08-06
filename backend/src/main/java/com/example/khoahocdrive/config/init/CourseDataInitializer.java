package com.example.khoahocdrive.config.init;

import com.example.khoahocdrive.english48ngay.entity.CourseDay;
import com.example.khoahocdrive.english48ngay.entity.VocabularyWord;
import com.example.khoahocdrive.english48ngay.repository.CourseDayRepository;
import com.example.khoahocdrive.english48ngay.repository.VocabularyWordRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class CourseDataInitializer {

    private final CourseDayRepository courseDayRepository;
    private final VocabularyWordRepository vocabularyWordRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        if (courseDayRepository.count() > 0) {
            log.info("Course days already seeded.");
            return;
        }

        try {
            // Read course.json from frontend directory
            File file = new File("E:\\Sourse Code\\my_course\\48ngay\\src\\48ngay\\data\\course.json");
            if (!file.exists()) {
                log.warn("course.json not found at expected path: {}", file.getAbsolutePath());
                return;
            }

            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, Object>> list = mapper.readValue(file, new TypeReference<List<Map<String, Object>>>() {
            });

            log.info("Seeding {} course days from course.json...", list.size());

            for (Map<String, Object> dayMap : list) {
                Integer day = (Integer) dayMap.get("day");
                String title = (String) dayMap.get("title");

                @SuppressWarnings("unchecked")
                Map<String, String> resources = (Map<String, String>) dayMap.get("resources");
                String video = resources != null ? resources.get("video") : null;
                String documents = resources != null ? resources.get("documents") : null;
                String exercises = resources != null ? resources.get("exercises") : null;
                String answers = resources != null ? resources.get("answers") : null;

                CourseDay courseDay = CourseDay.builder()
                        .day(day)
                        .title(title)
                        .videoUrl(video)
                        .documentUrl(documents)
                        .exerciseUrl(exercises)
                        .answerUrl(answers)
                        .vocabularies(new ArrayList<>())
                        .build();

                CourseDay savedDay = courseDayRepository.save(courseDay);

                @SuppressWarnings("unchecked")
                List<Map<String, Object>> vocabs = (List<Map<String, Object>>) dayMap.get("vocabularies");
                if (vocabs != null) {
                    for (Map<String, Object> vMap : vocabs) {
                        String vId = (String) vMap.get("id");
                        String word = (String) vMap.get("word");
                        String phonetic = (String) vMap.get("phonetic");
                        String meaning = (String) vMap.get("meaning");
                        String example = (String) vMap.get("example");
                        String exampleMeaning = (String) vMap.get("exampleMeaning");

                        @SuppressWarnings("unchecked")
                        List<String> options = (List<String>) vMap.get("options");
                        String optionsStr = options != null ? String.join(";", options) : "";
                        String correctAnswer = (String) vMap.get("correctAnswer");

                        VocabularyWord vocabularyWord = VocabularyWord.builder()
                                .vocabId(vId)
                                .word(word)
                                .phonetic(phonetic)
                                .meaning(meaning)
                                .example(example)
                                .exampleMeaning(exampleMeaning)
                                .optionsList(optionsStr)
                                .correctAnswer(correctAnswer)
                                .courseDay(savedDay)
                                .build();

                        vocabularyWordRepository.save(vocabularyWord);
                        savedDay.getVocabularies().add(vocabularyWord);
                    }
                }
            }
            log.info("Course days seeding completed successfully.");
        } catch (Exception e) {
            log.error("Failed to seed course data from course.json", e);
        }
    }
}
