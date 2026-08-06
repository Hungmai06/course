package com.example.khoahocdrive.english48ngay.service;

import com.example.khoahocdrive.english48ngay.entity.CourseDay;
import com.example.khoahocdrive.english48ngay.entity.CourseStudent;
import com.example.khoahocdrive.english48ngay.entity.StudentProgress;
import com.example.khoahocdrive.english48ngay.entity.VocabularyWord;
import com.example.khoahocdrive.english48ngay.repository.CourseDayRepository;
import com.example.khoahocdrive.english48ngay.repository.CourseStudentRepository;
import com.example.khoahocdrive.english48ngay.repository.StudentProgressRepository;
import com.example.khoahocdrive.english48ngay.repository.VocabularyWordRepository;
import com.example.khoahocdrive.exceptions.InvalidDataException;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.models.Order;
import com.example.khoahocdrive.models.OrderDetail;
import com.example.khoahocdrive.models.User;
import com.example.khoahocdrive.repository.OrderRepository;
import com.example.khoahocdrive.repository.UserRepository;
import com.example.khoahocdrive.supports.enums.OrderStatus;
import com.example.khoahocdrive.supports.enums.VipEnum;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EnglishService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CourseStudentRepository courseStudentRepository;
    
    private final CourseDayRepository courseDayRepository;
    private final VocabularyWordRepository vocabularyWordRepository;
    private final StudentProgressRepository studentProgressRepository;

    private boolean isEnglish48Ngay(String email, String keyword) {
        List<Order> orders = orderRepository.findByEmailAndStatus(email, OrderStatus.SUCCESS);
        if (orders.isEmpty()) {
            return false;
        }
        for (Order order : orders) {
            List<OrderDetail> orderDetails = order.getOrderDetails();
            for (OrderDetail orderDetail : orderDetails) {
                if (orderDetail.getCourse().getName().equals(keyword)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean isUserHasVip(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return false;
        }
        User user = userOptional.get();
        if (VipEnum.ENGLISH_48_NGAY.equals(user.getVip())) {
            return true;
        }
        return false;
    }

    public boolean checkUserHasEnglish48Ngay(String email, String keyword) {
        String normalized = email != null ? email.trim().toLowerCase() : "";
        
        // 1. Check manual CourseStudent list first
        if (courseStudentRepository.findByUsername(normalized).isPresent()) {
            return true;
        }
        
        // 2. Fallback to order / VIP checks
        return isEnglish48Ngay(normalized, keyword) || isUserHasVip(normalized);
    }

    // ==========================================
    // Course Student Management (CRUD)
    // ==========================================
    public List<CourseStudent> getAllStudents() {
        return courseStudentRepository.findAll();
    }

    public CourseStudent getStudentById(Long id) {
        return courseStudentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course student not found with id: " + id));
    }

    public CourseStudent createStudent(CourseStudent student) {
        if (student.getUsername() == null || student.getUsername().trim().isEmpty()) {
            throw new InvalidDataException("Username/Phone number cannot be empty");
        }
        String normalizedUsername = student.getUsername().trim().toLowerCase();
        if (courseStudentRepository.existsByUsername(normalizedUsername)) {
            throw new InvalidDataException("Username/Phone number already registered: " + student.getUsername());
        }
        student.setUsername(normalizedUsername);
        return courseStudentRepository.save(student);
    }

    public CourseStudent updateStudent(Long id, CourseStudent studentDetails) {
        CourseStudent student = getStudentById(id);
        
        if (studentDetails.getUsername() == null || studentDetails.getUsername().trim().isEmpty()) {
            throw new InvalidDataException("Username/Phone number cannot be empty");
        }
        
        String normalizedUsername = studentDetails.getUsername().trim().toLowerCase();
        if (!student.getUsername().equals(normalizedUsername) && courseStudentRepository.existsByUsername(normalizedUsername)) {
            throw new InvalidDataException("Username/Phone number already registered: " + studentDetails.getUsername());
        }
        
        student.setUsername(normalizedUsername);
        student.setName(studentDetails.getName());
        student.setClassName(studentDetails.getClassName());
        
        return courseStudentRepository.save(student);
    }

    public void deleteStudent(Long id) {
        CourseStudent student = getStudentById(id);
        courseStudentRepository.delete(student);
    }

    // ==========================================
    // Course Day (Lesson) & Vocabulary Management
    // ==========================================
    public List<CourseDay> getAllLessons() {
        return courseDayRepository.findAll();
    }

    public CourseDay getLessonByDay(Integer day) {
        return courseDayRepository.findByDay(day)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson day " + day + " not found"));
    }

    @Transactional
    public CourseDay createLesson(CourseDay lesson) {
        if (lesson.getDay() == null) {
            throw new InvalidDataException("Lesson day number is required");
        }
        if (courseDayRepository.existsByDay(lesson.getDay())) {
            throw new InvalidDataException("Lesson for day " + lesson.getDay() + " already exists");
        }
        
        List<VocabularyWord> words = lesson.getVocabularies();
        lesson.setVocabularies(new ArrayList<>());
        CourseDay savedDay = courseDayRepository.save(lesson);
        
        if (words != null) {
            for (VocabularyWord word : words) {
                word.setCourseDay(savedDay);
                vocabularyWordRepository.save(word);
                savedDay.getVocabularies().add(word);
            }
        }
        return savedDay;
    }

    @Transactional
    public CourseDay updateLesson(Integer day, CourseDay lessonDetails) {
        CourseDay lesson = getLessonByDay(day);
        
        lesson.setTitle(lessonDetails.getTitle());
        lesson.setVideoUrl(lessonDetails.getVideoUrl());
        lesson.setDocumentUrl(lessonDetails.getDocumentUrl());
        lesson.setExerciseUrl(lessonDetails.getExerciseUrl());
        lesson.setAnswerUrl(lessonDetails.getAnswerUrl());
        
        // Update vocabularies if provided
        if (lessonDetails.getVocabularies() != null) {
            // Remove old ones
            lesson.getVocabularies().clear();
            courseDayRepository.saveAndFlush(lesson);
            
            // Add new ones
            for (VocabularyWord word : lessonDetails.getVocabularies()) {
                word.setCourseDay(lesson);
                vocabularyWordRepository.save(word);
                lesson.getVocabularies().add(word);
            }
        }
        
        return courseDayRepository.save(lesson);
    }

    public void deleteLesson(Integer day) {
        CourseDay lesson = getLessonByDay(day);
        courseDayRepository.delete(lesson);
    }

    // ==========================================
    // Student Progress Management
    // ==========================================
    public List<StudentProgress> getStudentProgress(String username) {
        String normalizedUser = username != null ? username.trim().toLowerCase() : "";
        return studentProgressRepository.findByUsername(normalizedUser);
    }

    public StudentProgress updateStudentProgress(String username, Integer day, String status, Boolean vocabLearned) {
        if (username == null || username.trim().isEmpty()) {
            throw new InvalidDataException("Username is required to update progress");
        }
        if (day == null) {
            throw new InvalidDataException("Day is required to update progress");
        }
        
        String normalizedUser = username.trim().toLowerCase();
        StudentProgress progress = studentProgressRepository.findByUsernameAndDay(normalizedUser, day)
                .orElseGet(() -> StudentProgress.builder()
                        .username(normalizedUser)
                        .day(day)
                        .status("not_started")
                        .vocabLearned(false)
                        .build());
        
        if (status != null) {
            progress.setStatus(status);
        }
        if (vocabLearned != null) {
            progress.setVocabLearned(vocabLearned);
        }
        
        return studentProgressRepository.save(progress);
    }

    public com.example.khoahocdrive.dto.response.PagedResponse<CourseStudent> getAllStudents(int page, int size, String search) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"));
        org.springframework.data.domain.Page<CourseStudent> studentsPage;
        if (search != null && !search.trim().isEmpty()) {
            studentsPage = courseStudentRepository.findByNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(search, search, pageable);
        } else {
            studentsPage = courseStudentRepository.findAll(pageable);
        }
        return com.example.khoahocdrive.dto.response.PagedResponse.<CourseStudent>builder()
                .content(studentsPage.getContent())
                .pageNumber(studentsPage.getNumber())
                .pageSize(studentsPage.getSize())
                .totalElements(studentsPage.getTotalElements())
                .totalPages(studentsPage.getTotalPages())
                .build();
    }
}
