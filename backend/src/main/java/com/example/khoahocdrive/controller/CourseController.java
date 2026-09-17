package com.example.khoahocdrive.controller;

import com.example.khoahocdrive.dto.request.CourseRequest;
import com.example.khoahocdrive.dto.response.ApiResponse;
import com.example.khoahocdrive.dto.response.CourseResponse;
import com.example.khoahocdrive.dto.response.PagedResponse;
import com.example.khoahocdrive.service.CourseService;
import com.example.khoahocdrive.service.SearchCourse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course")
@RequiredArgsConstructor
@Tag(name = "COURSE API")
public class CourseController {
    private final CourseService courseService;
    private final SearchCourse searchCourse;
    @GetMapping("/")
    @Operation(summary = "Get all course")
    public ApiResponse<PagedResponse<CourseResponse>> getAll(@RequestParam int page,@RequestParam int size){
        return courseService.getAll(page,size);
    }
    @GetMapping("/category/")
    @Operation(summary = "Get all course by CategoryName")
    public ApiResponse<PagedResponse<CourseResponse>> getAllByCategoryName(@RequestParam int page,@RequestParam int size,@RequestParam String name){
        return courseService.getAllByCategoryId(page,size,name);
    }
    @PostMapping(value = "/",consumes = "multipart/form-data")
//    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Create course")
    public ApiResponse<CourseResponse> create(@RequestPart("file") MultipartFile file, @RequestPart("data") CourseRequest data) throws Exception {
        return  courseService.create(file,data);
    }

    @PutMapping(value = "/{id}",consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Update Course")
    public ApiResponse<CourseResponse> update(@PathVariable Long id,@RequestPart("file") MultipartFile file,  @RequestPart("data") CourseRequest request) throws Exception {
        return courseService.update(id,file,request);
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Delete Course")
    public ApiResponse<String> delete(@PathVariable Long id){
        courseService.delete(id);
        return ApiResponse.<String>builder()
                .message("Xóa khóa học thành công")
                .data("Deleted course with ID: " + id)
                .build();
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('USER')")
    @Operation(summary = "Get My Course")
    public ApiResponse<List<CourseResponse>> getMyCourse(@PathVariable Long userId){
        return courseService.getMyCourse(userId);
    }
    @GetMapping("/search")
    @Operation(summary = "Search Course")
    public ApiResponse<PagedResponse<CourseResponse>> search(@RequestParam String keyword,@RequestParam int page, @RequestParam int size){
        return searchCourse.searchCourses(keyword,page,size);
    }
    @GetMapping("/{id}/detail")
    @Operation(summary = "Get Course by Id")
    public ApiResponse<CourseResponse> findCourseById(@PathVariable Long id){
        return courseService.findCourseById(id);
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get Course by Slug")
    public ApiResponse<CourseResponse> findCourseBySlug(@PathVariable String slug){
        return courseService.findCourseBySlug(slug);
    }

    @PostMapping("/sync-slugs")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Synchronize course slugs")
    public ApiResponse<String> syncSlugs(){
        return courseService.syncSlugs();
    }

    @GetMapping("/full-course")
    @Operation(summary = "Get Full Course detail")
    public ApiResponse<CourseResponse> getFullCourse(){
        return courseService.getFullCourse();
    }

    @PutMapping(value = "/full-course", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Update Full Course detail (Multipart)")
    public ApiResponse<CourseResponse> updateFullCourse(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("data") CourseRequest request) throws Exception {
        return courseService.updateFullCourse(file, request);
    }

    @PutMapping(value = "/full-course", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Update Full Course detail (JSON)")
    public ApiResponse<CourseResponse> updateFullCourseJson(
            @RequestBody CourseRequest request) throws Exception {
        return courseService.updateFullCourse(null, request);
    }
}
