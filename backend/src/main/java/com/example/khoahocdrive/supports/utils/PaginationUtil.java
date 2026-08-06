package com.example.khoahocdrive.supports.utils;

import jakarta.persistence.Column;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
@Component
public class PaginationUtil {
    public <T> Page<T> toPage(List<T> list, Pageable pageable){
        int start = (int) pageable.getOffset();
        int end = Math.min((pageable.getPageSize()+start),list.size());
        List<T> subList  = list.subList(start,end);
        return new PageImpl<>(subList,pageable,list.size());
    }
}
