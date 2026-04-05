package com.meufluxo.service;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.dto.holiday.HolidayResponse;
import com.meufluxo.enums.HolidayScope;
import com.meufluxo.mapper.HolidayMapper;
import com.meufluxo.model.Holiday;
import com.meufluxo.repository.HolidayRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class HolidayService extends BaseUserService {

    private final HolidayRepository holidayRepository;
    private final HolidayMapper holidayMapper;

    public HolidayService(
            CurrentUserService currentUserService,
            HolidayRepository holidayRepository,
            HolidayMapper holidayMapper
    ) {
        super(currentUserService);
        this.holidayRepository = holidayRepository;
        this.holidayMapper = holidayMapper;
    }

    @Transactional(readOnly = true)
    public PageResponse<HolidayResponse> findByFilters(
            LocalDate startDate,
            LocalDate endDate,
            HolidayScope scope,
            Pageable pageable
    ) {
        validateDateRange(startDate, endDate);

        Specification<Holiday> specification = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("active"), true));

            Long workspaceId = getCurrentWorkspaceId();
            predicates.add(
                    cb.or(
                            cb.equal(root.get("scope"), HolidayScope.NATIONAL),
                            cb.and(
                                    cb.equal(root.get("scope"), HolidayScope.WORKSPACE),
                                    cb.equal(root.get("workspace").get("id"), workspaceId)
                            )
                    )
            );

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("holidayDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("holidayDate"), endDate));
            }
            if (scope != null) {
                predicates.add(cb.equal(root.get("scope"), scope));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Holiday> page = holidayRepository.findAll(specification, pageable);
        Page<HolidayResponse> responsePage = page.map(holidayMapper::toResponse);
        return PageResponse.toPageResponse(responsePage);
    }

    @Transactional(readOnly = true)
    public HolidayResponse findById(Long id) {
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Feriado não encontrado com ID: " + id));

        boolean visible = holiday.getScope() == HolidayScope.NATIONAL
                || (holiday.getScope() == HolidayScope.WORKSPACE
                && holiday.getWorkspace() != null
                && holiday.getWorkspace().getId().equals(getCurrentWorkspaceId()));
        if (!visible || !holiday.isActive()) {
            throw new NotFoundException("Feriado não encontrado com ID: " + id);
        }

        return holidayMapper.toResponse(holiday);
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BusinessException("Intervalo de data inválido: startDate maior que endDate.");
        }
    }
}
