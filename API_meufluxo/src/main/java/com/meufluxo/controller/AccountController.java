package com.meufluxo.controller;

import com.meufluxo.common.dto.PageResponse;
import com.meufluxo.dto.account.AccountRequest;
import com.meufluxo.dto.account.AccountResponse;
import com.meufluxo.dto.account.AccountUpdateRequest;
import com.meufluxo.service.AccountService;
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
@RequestMapping(value = "/accounts")
@Tag(name = "Contas", description = "Operações de contas (criar, listar, atualizar, excluir)")
public class AccountController {

    private final AccountService service;

    public AccountController(AccountService service) {
        this.service = service;
    }

    @GetMapping("{id}")
    @Operation(
            summary = "Buscar conta por ID",
            description = "Retorna os dados da conta correspondente ao ID informado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Conta encontrada",
                    content = @Content(schema = @Schema(implementation = AccountResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Conta não encontrada", content = @Content),
            @ApiResponse(responseCode = "400", description = "Parâmetros inválidos", content = @Content)
    })
    public ResponseEntity<AccountResponse> getAccountById(
            @Parameter(description = "ID da conta", example = "1", required = true)
            @PathVariable Long id
    ) {
        AccountResponse response = service.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(
            summary = "Listar contas",
            description = "Lista contas com paginação e ordenação."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista retornada com sucesso"
                    // Se seu PageResponse é genérico, o schema aqui pode ficar simples ou você pode criar
                    // uma classe específica PageAccountResponse para documentar melhor.
            ),
            @ApiResponse(responseCode = "400", description = "Parâmetros inválidos", content = @Content)
    })
    public PageResponse<AccountResponse> getAllAccounts(
            @Parameter(description = "Paginação e ordenação (page, size, sort)")
            @PageableDefault(
                    page = 0,
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {
        return service.getAll(pageable);
    }

    @PostMapping
    @Operation(
            summary = "Criar conta",
            description = "Cria uma nova conta. O saldo inicial é inicializado conforme regra de negócio."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Conta criada",
                    content = @Content(schema = @Schema(implementation = AccountResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "Já existe uma conta com este nome", content = @Content)
    })
    public ResponseEntity<AccountResponse> createAccount(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Dados para criação de conta",
                    content = @Content(schema = @Schema(implementation = AccountRequest.class))
            )
            @Valid @RequestBody AccountRequest request
    ) {
        AccountResponse createdAccount = service.create(request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(createdAccount.id()).toUri();
        return ResponseEntity.created(uri).body(createdAccount);
    }

    @PatchMapping("/{id}")
    @Operation(
            summary = "Atualizar conta (parcial)",
            description = "Atualiza campos informados (ex.: name e active). Campos não enviados não são alterados."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Conta atualizada",
                    content = @Content(schema = @Schema(implementation = AccountResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Conta não encontrada", content = @Content),
            @ApiResponse(responseCode = "409", description = "Já existe uma conta com este nome", content = @Content)
    })
    public ResponseEntity<AccountResponse> updateAccount(
            @Parameter(description = "ID da conta", example = "1", required = true)
            @PathVariable Long id,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Campos para atualização (parcial)",
                    content = @Content(schema = @Schema(implementation = AccountUpdateRequest.class))
            )
            @Valid @RequestBody AccountUpdateRequest request
    ) {
        AccountResponse updatedAccount = service.update(id, request);
        return ResponseEntity.ok(updatedAccount);
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Excluir conta",
            description = "Exclui uma conta caso não existam movimentações vinculadas. Caso existam, deve ser inativada."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Conta excluída"),
            @ApiResponse(responseCode = "404", description = "Conta não encontrada", content = @Content),
            @ApiResponse(responseCode = "409", description = "Conta possui movimentações vinculadas", content = @Content)
    })
    public ResponseEntity<Void> deleteAccount(
            @Parameter(description = "ID da conta", example = "1", required = true)
            @PathVariable Long id
    ) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

}
