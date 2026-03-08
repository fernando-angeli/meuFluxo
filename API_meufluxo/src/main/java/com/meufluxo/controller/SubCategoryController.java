package com.meufluxo.controller;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.dto.subCategory.SubCategoryRequest;
import com.meufluxo.dto.subCategory.SubCategoryResponse;
import com.meufluxo.dto.subCategory.SubCategoryUpdateRequest;
import com.meufluxo.service.SubCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping(value = "/categories/sub-categories")
@Tag(name = "SubCategorias", description = "Operações de subCategorias (criar, listar, atualizar, excluir)")
public class SubCategoryController {

    private final SubCategoryService service;

    public SubCategoryController(SubCategoryService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Buscar categoria por ID",
            description = "Retorna os dados da categoria correspondente ao ID informado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Categoria encontrada",
                    content = @Content(schema = @Schema(implementation = SubCategoryResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Categoria não encontrada", content = @Content),
            @ApiResponse(responseCode = "400", description = "Parâmetros inválidos", content = @Content)
    })
    public ResponseEntity<SubCategoryResponse> getSubCategoryById(
            @Parameter(description = "ID da categoria", example = "1", required = true)
            @PathVariable Long id
    ) {
        SubCategoryResponse response = service.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(
            summary = "Listar subSubCategorias",
            description = "Lista subSubCategorias com paginação e ordenação."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista retornada com sucesso"
            ),
            @ApiResponse(responseCode = "400", description = "Parâmetros inválidos", content = @Content)
    })
    public PageResponse<SubCategoryResponse> getAllSubCategories(
            @Parameter(description = "Paginação e ordenação (page, size, sort)")
            @PageableDefault(
                    page = 0,
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {
        return service.findAll(pageable);
    }

    @PostMapping
    @Operation(
            summary = "Criar categoria",
            description = "Cria uma nova categoria. O nome deve ser único."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Categoria criada",
                    content = @Content(schema = @Schema(implementation = SubCategoryResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "Já existe uma categoria com este nome", content = @Content)
    })
    public ResponseEntity<SubCategoryResponse> createSubCategory(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Dados para criação da categoria",
                    content = @Content(schema = @Schema(implementation = SubCategoryRequest.class))
            )
            @Valid @RequestBody SubCategoryRequest request

    ) {
        SubCategoryResponse createdSubCategory = service.create(request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(createdSubCategory.id()).toUri();
        return ResponseEntity.created(uri).body(createdSubCategory);
    }

    @PatchMapping("/{id}")
    @Operation(
            summary = "Atualizar categoria (parcial)",
            description = "Atualiza apenas os campos enviados (ex.: name e active). Campos não enviados não são alterados."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Categoria atualizada",
                    content = @Content(schema = @Schema(implementation = SubCategoryResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Categoria não encontrada", content = @Content),
            @ApiResponse(responseCode = "409", description = "Já existe uma categoria com este nome", content = @Content)
    })
    public ResponseEntity<SubCategoryResponse> updateSubCategory(
            @Parameter(description = "ID da categoria", example = "1", required = true)
            @PathVariable Long id,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Campos para atualização parcial",
                    content = @Content(schema = @Schema(implementation = SubCategoryUpdateRequest.class))
            )
            @Valid @RequestBody SubCategoryUpdateRequest request

    ) {
        SubCategoryResponse updatedSubCategory = service.update(id, request);
        return ResponseEntity.ok(updatedSubCategory);
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Excluir categoria",
            description = "Exclui uma categoria caso não existam movimentações vinculadas. Se existirem, a categoria deve ser inativada."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Categoria excluída", content = @Content),
            @ApiResponse(responseCode = "404", description = "Categoria não encontrada", content = @Content),
            @ApiResponse(responseCode = "409", description = "Categoria possui movimentações vinculadas", content = @Content)
    })
    public ResponseEntity<Void> deleteSubCategory(
            @Parameter(description = "ID da categoria", example = "1", required = true)
            @PathVariable Long id
    ) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
