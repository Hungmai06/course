package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.dto.request.CourseRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.CourseResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import com.example.khoahocdrive.exceptions.InvalidDataException;
import com.example.khoahocdrive.exceptions.ResourceNotFoundException;
import com.example.khoahocdrive.mapper.CourseMapper;
import com.example.khoahocdrive.models.Author;
import com.example.khoahocdrive.models.Category;
import com.example.khoahocdrive.models.Course;
import com.example.khoahocdrive.models.Order;
import com.example.khoahocdrive.models.OrderDetail;
import com.example.khoahocdrive.models.CartItem;
import com.example.khoahocdrive.repository.AuthorRepository;
import com.example.khoahocdrive.repository.CategoryRepository;
import com.example.khoahocdrive.repository.CourseRepository;
import com.example.khoahocdrive.repository.OrderDetailRepository;
import com.example.khoahocdrive.repository.OrderRepository;
import com.example.khoahocdrive.repository.CartItemRepository;
import com.example.khoahocdrive.service.CloudinaryService;
import com.example.khoahocdrive.service.CourseService;
import com.example.khoahocdrive.supports.utils.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import com.example.khoahocdrive.supports.utils.CloudinaryUtils;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.example.khoahocdrive.models.FullCourseConfig;
import com.example.khoahocdrive.repository.FullCourseConfigRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {
    private final CourseRepository courseRepository;
    private final FullCourseConfigRepository fullCourseConfigRepository;
    private final CourseMapper courseMapper;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final CloudinaryService cloudinaryService;
    private final PaginationUtil paginationUtil;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final CartItemRepository cartItemRepository;
    @Override
    public ApiResponse<CourseResponse> findCourseById(Long id) {
        Course course = courseRepository.findById(id).orElseThrow(
                ()-> new ResourceNotFoundException("Course not found")
        );
        if (Boolean.TRUE.equals(course.getIsFullCourse()) || "full-course".equalsIgnoreCase(course.getSlug())) {
            return getFullCourse();
        }
        return ApiResponse.<CourseResponse>builder()
                .message("Find Course By id")
                .data(courseMapper.toResponse(course))
                .build();
    }

    @Override
    public ApiResponse<CourseResponse> create(MultipartFile file,CourseRequest request) throws Exception {
        Optional<Course> optionalCourse = courseRepository.findCourseByName(request.getName());
       if(optionalCourse.isPresent()){
           throw new InvalidDataException("Course existed");
       }
        Author author = authorRepository.findAuthorByName(request.getAuthorName()).orElseThrow(
                ()-> new ResourceNotFoundException("Author not found")
        );
        Category category = categoryRepository.findCategoryByName(request.getCategoryName()).orElseThrow(
                ()-> new ResourceNotFoundException(("Category not found"))
        );
        String fileUrl = cloudinaryService.uploadImage(file);

        String slug = request.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = generateSlug(request.getName());
        }
        String finalSlug = slug;
        int suffix = 1;
        while (courseRepository.findCourseBySlug(finalSlug).isPresent()) {
            finalSlug = slug + "-" + suffix;
            suffix++;
        }

        Course course = Course.builder()
               .name(request.getName())
               .author(author)
               .linkDrive(request.getLinkDrive())
               .linkDrive2(request.getLinkDrive2())
               .linkTest(request.getLinkTest())
               .linkTest2(request.getLinkTest2())
               .isFullCourse(request.getIsFullCourse() != null ? request.getIsFullCourse() : false)
               .description(request.getDescription())
               .newPrice(request.getNewPrice())
               .oldPrice(request.getOldPrice())
               .avatar(fileUrl)
               .category(category)
               .slug(finalSlug)
               .build();
       courseRepository.save(course);
       CourseResponse courseResponse = courseMapper.toResponse(course);
       courseResponse.setNameAuthor(author.getName());
       courseResponse.setNameCategory(category.getName());
        return ApiResponse.<CourseResponse>builder()
                .data(courseResponse)
                .message("Create course successfully")
                .build();
    }

    @Override
    public ApiResponse<CourseResponse> update(Long id,MultipartFile file, CourseRequest request) throws Exception {
        Course course = courseRepository.findById(id).orElseThrow(
                ()->new ResourceNotFoundException("Course not found")
        );

        if(file != null && !file.isEmpty()){
            String newImageUrl = cloudinaryService.uploadImage(file);
            course.setAvatar(newImageUrl);
        }
        if (request.getAuthorName() != null && !request.getAuthorName().isBlank()) {
            Author author = authorRepository.findAuthorByName(request.getAuthorName())
                    .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
            course.setAuthor(author);
        }

        if (request.getCategoryName() != null && !request.getCategoryName().isBlank()) {
            Category category = categoryRepository.findCategoryByName(request.getCategoryName())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            course.setCategory(category);
        }

        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            course.setDescription(request.getDescription());
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            course.setName(request.getName());
        }

        if (request.getLinkDrive() != null && !request.getLinkDrive().isBlank()) {
            course.setLinkDrive(request.getLinkDrive());
        }

        if (request.getLinkDrive2() != null && !request.getLinkDrive2().isBlank()) {
            course.setLinkDrive2(request.getLinkDrive2());
        }

        if (request.getLinkTest() != null && !request.getLinkTest().isBlank()) {
            course.setLinkTest(request.getLinkTest());
        }

        if (request.getLinkTest2() != null && !request.getLinkTest2().isBlank()) {
            course.setLinkTest2(request.getLinkTest2());
        }

        if (request.getIsFullCourse() != null) {
            course.setIsFullCourse(request.getIsFullCourse());
        }

        if (request.getNewPrice() != null) {
            course.setNewPrice(request.getNewPrice());
        }

        if (request.getOldPrice() != null) {
            course.setOldPrice(request.getOldPrice());
        }

        if (request.getSlug() != null && !request.getSlug().trim().isEmpty()) {
            String slug = request.getSlug().trim();
            String finalSlug = slug;
            int suffix = 1;
            while (true) {
                Optional<Course> existing = courseRepository.findCourseBySlug(finalSlug);
                if (existing.isPresent() && !existing.get().getId().equals(course.getId())) {
                    finalSlug = slug + "-" + suffix;
                    suffix++;
                } else {
                    break;
                }
            }
            course.setSlug(finalSlug);
        } else if (course.getSlug() == null || course.getSlug().trim().isEmpty()) {
            String nameToUse = request.getName() != null ? request.getName() : course.getName();
            String slug = generateSlug(nameToUse);
            String finalSlug = slug;
            int suffix = 1;
            while (true) {
                Optional<Course> existing = courseRepository.findCourseBySlug(finalSlug);
                if (existing.isPresent() && !existing.get().getId().equals(course.getId())) {
                    finalSlug = slug + "-" + suffix;
                    suffix++;
                } else {
                    break;
                }
            }
            course.setSlug(finalSlug);
        }

        courseRepository.save(course);
        return ApiResponse.<CourseResponse>builder()
                .message("Update Course")
                .data(courseMapper.toResponse(course))
                .build();
    }

    @Override
    public ApiResponse<PagedResponse<CourseResponse>> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page,size,Sort.by(Sort.Direction.DESC, "id"));
        Page<Course> courses = courseRepository.findAll(pageable);
        List<CourseResponse> courseResponses= courses.stream().map(courseMapper::toResponse).toList();
        PagedResponse<CourseResponse> courseResponsePagedResponse = PagedResponse.<CourseResponse>builder()
                .content(courseResponses)
                .pageNumber(courses.getNumber())
                .pageSize(courses.getSize())
                .totalElements(courses.getTotalElements())
                .totalPages(courses.getTotalPages())
                .build();
        return ApiResponse.<PagedResponse<CourseResponse>>builder()
                .data(courseResponsePagedResponse)
                .message("Get all course")
                .build();
    }
    @Override
    public ApiResponse<PagedResponse<CourseResponse>> getAllByCategoryId(int page, int size, String name) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));

        Page<Course> courses = courseRepository.findByCategory_Name(name, pageable);

        List<CourseResponse> courseResponses = courses.stream()
                .map(courseMapper::toResponse)
                .toList();

        PagedResponse<CourseResponse> paged = PagedResponse.<CourseResponse>builder()
                .content(courseResponses)
                .pageNumber(courses.getNumber())
                .pageSize(courses.getSize())
                .totalElements(courses.getTotalElements())
                .totalPages(courses.getTotalPages())
                .build();

        return ApiResponse.<PagedResponse<CourseResponse>>builder()
                .data(paged)
                .message("Get all course")
                .build();
    }

    @Override
    public void delete(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Xóa OrderDetail liên quan trước để tránh foreign key constraint
        List<OrderDetail> relatedDetails = orderDetailRepository.findByCourseId(id);
        if (!relatedDetails.isEmpty()) {
            orderDetailRepository.deleteAll(relatedDetails);
        }

        // Xóa CartItem liên quan trước để tránh foreign key constraint
        List<CartItem> relatedCartItems = cartItemRepository.findByCourseId(id);
        if (!relatedCartItems.isEmpty()) {
            cartItemRepository.deleteAll(relatedCartItems);
        }

        // Xóa ảnh trên Cloudinary nếu có
        if (course.getAvatar() != null && !course.getAvatar().isEmpty()) {
            try {
                // Extract public_id từ URL Cloudinary (optional, skip nếu lỗi)
                String avatar = course.getAvatar();
                String publicId = avatar.substring(avatar.lastIndexOf("/") + 1, avatar.lastIndexOf("."));
                cloudinaryService.deleteImage(publicId);
            } catch (Exception ignored) {}
        }

        courseRepository.deleteById(id);
    }

    @Override
    public ApiResponse<List<CourseResponse>> getMyCourse(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        List<Course> courses = orders.stream()
                .flatMap(order -> order.getOrderDetails().stream())
                .map(OrderDetail::getCourse)
                .filter(Objects::nonNull)
                .distinct() // nếu muốn loại trùng (requires equals/hashCode in Course)
                .toList();
        List<CourseResponse> courseResponses = courses.stream().map(courseMapper::toResponse).toList();
        return ApiResponse.<List<CourseResponse>>builder()
                .message("Get My Course")
                .data(courseResponses)
                .build();
    }

    @Override
    public ApiResponse<CourseResponse> findCourseBySlug(String slug) {
        if ("full-course".equalsIgnoreCase(slug)) {
            return getFullCourse();
        }
        Course course = courseRepository.findCourseBySlug(slug).orElseThrow(
                () -> new ResourceNotFoundException("Course not found with slug: " + slug)
        );
        return ApiResponse.<CourseResponse>builder()
                .message("Find Course By slug")
                .data(courseMapper.toResponse(course))
                .build();
    }

    @Override
    public ApiResponse<String> syncSlugs() {
        List<Course> courses = courseRepository.findAll();
        int count = 0;
        for (Course course : courses) {
            String newSlug = generateSlug(course.getName());
            String finalSlug = newSlug;
            int suffix = 1;
            while (true) {
                final String currentFinalSlug = finalSlug;
                Optional<Course> existing = courses.stream()
                    .filter(c -> !c.getId().equals(course.getId()) && currentFinalSlug.equals(c.getSlug()))
                    .findFirst();
                if (existing.isPresent()) {
                    finalSlug = newSlug + "-" + suffix;
                    suffix++;
                } else {
                    break;
                }
            }
            course.setSlug(finalSlug);
            courseRepository.save(course);
            count++;
        }
        return ApiResponse.<String>builder()
                .message("Synchronized " + count + " course slugs successfully")
                .data("Success")
                .build();
    }

    private String generateSlug(String text) {
        if (text == null) return "";
        
        String from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềấệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ";
        String to =   "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyaaaaaaaaaaaaaaaaaeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";
        
        String str = text.trim().toLowerCase();
        
        for (int i = 0; i < from.length(); i++) {
            char fromChar = from.charAt(i);
            char toChar = to.charAt(Math.min(i, to.length() - 1));
            str = str.replace(fromChar, toChar);
        }
        
        str = str.replaceAll("\\s+", "-");
        str = str.replaceAll("[^\\w-]", "");
        str = str.replaceAll("-+", "-");
        str = str.replaceAll("^-+|-+$", "");
        
        return str;
    }

    private FullCourseConfig getOrCreateConfig() {
        return fullCourseConfigRepository.findById(1L).orElseGet(() -> {
            FullCourseConfig config = FullCourseConfig.builder()
                .id(1L)
                .name("Trọn Bộ Full Tất Cả Khóa Học Drive MH")
                .description("<h3>🎉 Bạn sẽ có gì trong gói Full Khóa Học?</h3>\n<ul>\n  <li><strong>1000+ Khóa học chọn lọc:</strong> Đầy đủ các lĩnh vực Lập trình, Ngoại ngữ, Thiết kế đồ họa, Marketing, Kinh doanh online...</li>\n  <li><strong>Hệ thống 2 Link Google Drive:</strong> Link chính và Link dự phòng đồng bộ tốc độ cao.</li>\n  <li><strong>Cập nhật miễn phí:</strong> Khóa học mới được upload và làm mới liên tục mỗi ngày.</li>\n  <li><strong>Xem online & Tải về offline:</strong> Thoải mái xem trực tuyến hoặc tải trọn bộ về máy cá nhân lưu trữ.</li>\n</ul>")
                .oldPrice(new java.math.BigDecimal("100000000"))
                .newPrice(new java.math.BigDecimal("599000"))
                .avatar("/bn.png")
                .linkDrive("https://drive.google.com/drive/folders/1RJ5xX2am3KivbbzzmEZ6Y3lkSB4CfFpN?usp=drive_link")
                .linkDrive2("https://drive.google.com/drive/folders/1RJ5xX2am3KivbbzzmEZ6Y3lkSB4CfFpN?usp=drive_link")
                .linkTest("https://drive.google.com/drive/folders/1RJ5xX2am3KivbbzzmEZ6Y3lkSB4CfFpN?usp=drive_link")
                .linkTest2("https://drive.google.com/drive/folders/1RJ5xX2am3KivbbzzmEZ6Y3lkSB4CfFpN?usp=drive_link")
                .isFullCourse(true)
                .build();
            return fullCourseConfigRepository.save(config);
        });
    }

    private Course getOrCreateFullCourseEntity(FullCourseConfig config) {
        Optional<Course> courseOpt = courseRepository.findCourseBySlug("full-course");
        if (courseOpt.isEmpty()) {
            courseOpt = courseRepository.findFirstByIsFullCourseTrueOrderByIdDesc();
        }
        Course course;
        if (courseOpt.isPresent()) {
            course = courseOpt.get();
        } else {
            Author author = authorRepository.findAll().stream().findFirst().orElse(null);
            Category category = categoryRepository.findAll().stream().findFirst().orElse(null);
            course = Course.builder()
                .name(config.getName())
                .description(config.getDescription())
                .oldPrice(config.getOldPrice())
                .newPrice(config.getNewPrice())
                .avatar(config.getAvatar())
                .linkDrive(config.getLinkDrive())
                .linkDrive2(config.getLinkDrive2())
                .linkTest(config.getLinkTest())
                .linkTest2(config.getLinkTest2())
                .isFullCourse(true)
                .slug("full-course")
                .author(author)
                .category(category)
                .build();
        }

        course.setName(config.getName());
        course.setDescription(config.getDescription());
        course.setOldPrice(config.getOldPrice());
        course.setNewPrice(config.getNewPrice());
        if (config.getAvatar() != null && !config.getAvatar().isBlank()) {
            course.setAvatar(config.getAvatar());
        }
        course.setLinkDrive(config.getLinkDrive());
        course.setLinkDrive2(config.getLinkDrive2());
        course.setLinkTest(config.getLinkTest());
        course.setLinkTest2(config.getLinkTest2());
        course.setIsFullCourse(true);
        course.setSlug("full-course");

        return courseRepository.save(course);
    }

    @Override
    public ApiResponse<CourseResponse> getFullCourse() {
        FullCourseConfig config = getOrCreateConfig();
        Course courseEntity = getOrCreateFullCourseEntity(config);

        CourseResponse response = CourseResponse.builder()
                .id(courseEntity.getId())
                .name(config.getName())
                .description(config.getDescription())
                .oldPrice(config.getOldPrice())
                .newPrice(config.getNewPrice())
                .avatar(CloudinaryUtils.optimize(config.getAvatar()))
                .linkDrive(config.getLinkDrive())
                .linkDrive2(config.getLinkDrive2())
                .linkTest(config.getLinkTest())
                .linkTest2(config.getLinkTest2())
                .isFullCourse(config.getIsFullCourse())
                .slug("full-course")
                .build();

        return ApiResponse.<CourseResponse>builder()
                .message("Get Full Course successfully")
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<CourseResponse> updateFullCourse(MultipartFile file, CourseRequest request) throws Exception {
        FullCourseConfig config = getOrCreateConfig();

        if (file != null && !file.isEmpty()) {
            String fileUrl = cloudinaryService.uploadImage(file);
            config.setAvatar(fileUrl);
        }

        if (request != null) {
            if (request.getName() != null && !request.getName().isBlank()) {
                config.setName(request.getName());
            }
            if (request.getDescription() != null) {
                config.setDescription(request.getDescription());
            }
            if (request.getOldPrice() != null) {
                config.setOldPrice(request.getOldPrice());
            }
            if (request.getNewPrice() != null) {
                config.setNewPrice(request.getNewPrice());
            }
            if (request.getLinkDrive() != null) {
                config.setLinkDrive(request.getLinkDrive());
            }
            if (request.getLinkDrive2() != null) {
                config.setLinkDrive2(request.getLinkDrive2());
            }
            if (request.getLinkTest() != null) {
                config.setLinkTest(request.getLinkTest());
            }
            if (request.getLinkTest2() != null) {
                config.setLinkTest2(request.getLinkTest2());
            }
            if (request.getIsFullCourse() != null) {
                config.setIsFullCourse(request.getIsFullCourse());
            }
        }

        config = fullCourseConfigRepository.save(config);
        Course courseEntity = getOrCreateFullCourseEntity(config);

        CourseResponse response = CourseResponse.builder()
                .id(courseEntity.getId())
                .name(config.getName())
                .description(config.getDescription())
                .oldPrice(config.getOldPrice())
                .newPrice(config.getNewPrice())
                .avatar(CloudinaryUtils.optimize(config.getAvatar()))
                .linkDrive(config.getLinkDrive())
                .linkDrive2(config.getLinkDrive2())
                .linkTest(config.getLinkTest())
                .linkTest2(config.getLinkTest2())
                .isFullCourse(config.getIsFullCourse())
                .slug("full-course")
                .build();

        return ApiResponse.<CourseResponse>builder()
                .message("Update Full Course successfully")
                .data(response)
                .build();
    }

}
