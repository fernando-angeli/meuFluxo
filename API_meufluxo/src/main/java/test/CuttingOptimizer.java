import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

/**
 * Otimizador de corte de perfis (PVC, alumínio, ferro, etc.)
 *
 * Algoritmo: First Fit Decreasing (FFD)
 *   - Ordena peças da maior para a menor
 *   - Para cada peça, tenta encaixar em retalhos existentes primeiro,
 *     depois em barras já abertas, por último abre uma barra nova
 *   - Sobras >= minReusableLength são marcadas como reaproveitáveis
 *
 * Suporte a Virtual Threads (Java 21+) para processar múltiplos perfis em paralelo.
 */
public class CuttingOptimizer {

    // -------------------------------------------------------------------------
    // Modelos de dados
    // -------------------------------------------------------------------------

    /** Uma peça a ser cortada */
    public record PieceRequest(
            String jobCode,      // ex: "J01"
            int    quantity,     // quantidade desta peça
            String partCode,     // código único da peça
            int    length        // comprimento em mm
    ) {}

    /** Uma peça já alocada dentro de uma barra/retalho */
    public record AllocatedPiece(
            String jobCode,
            String partCode,
            int    length
    ) {}

    /** Um retalho pré-existente (sobra de sessão anterior) */
    public record Remnant(
            String remnantId,    // identificador do retalho
            int    availableLength  // comprimento disponível em mm
    ) {}

    /** Uma barra (nova ou retalho) com suas peças alocadas */
    public static class Bar {
        private static int counter = 1;

        public final String  barId;
        public final boolean isRemnant;       // true = era um retalho pré-existente
        public final int     originalLength;  // tamanho total da barra/retalho
        public final String  remnantSourceId; // id do retalho de origem (null se barra nova)
        private int          usedLength;
        private final List<AllocatedPiece> pieces = new ArrayList<>();

        /** Cria barra nova */
        public Bar(int originalLength, int endWaste) {
            this.barId           = "barra_" + counter++;
            this.isRemnant       = false;
            this.remnantSourceId = null;
            this.originalLength  = originalLength;
            this.usedLength      = endWaste; // desperdício de pontas já descontado
        }

        /** Cria a partir de um retalho */
        public Bar(Remnant remnant) {
            this.barId           = "retalho_" + remnant.remnantId();
            this.isRemnant       = true;
            this.remnantSourceId = remnant.remnantId();
            this.originalLength  = remnant.availableLength();
            this.usedLength      = 0; // retalho não tem desperdício de pontas
        }

        public int remainingLength() {
            return originalLength - usedLength;
        }

        /**
         * Tenta alocar uma peça.
         * @param piece      peça a alocar
         * @param cutWaste   desperdício por corte (mm)
         * @return true se encaixou
         */
        public boolean tryAllocate(AllocatedPiece piece, int cutWaste) {
            // Se já tem peças, desconta o kerf (desperdício do disco de corte)
            int kerfCost = pieces.isEmpty() ? 0 : cutWaste;
            if (remainingLength() >= piece.length() + kerfCost) {
                usedLength += piece.length() + kerfCost;
                pieces.add(piece);
                return true;
            }
            return false;
        }

        public List<AllocatedPiece> getPieces()     { return Collections.unmodifiableList(pieces); }
        public int                  getUsedLength()  { return usedLength; }
        public int                  getWaste()       { return originalLength - usedLength; }
    }

    /** Resultado completo de um perfil */
    public record CutResult(
            int             profileCode,
            List<Bar>       bars,
            List<Remnant>   leftoverRemnants,   // retalhos que sobraram reaproveitáveis
            int             totalBarsUsed,
            int             totalRemnantBarsUsed,
            int             totalWasteMm,
            double          wastePercent
    ) {}

    /** Parâmetros do processo de corte */
    public record CutParameters(
            int barLength,          // comprimento da barra nova (mm)
            int endWaste,           // desperdício de pontas (mm) — ambas as pontas somadas
            int cutWaste,           // desperdício por corte/kerf (mm)
            int minReusableLength   // sobra mínima para ser reaproveitável (mm)
    ) {
        /** Parâmetros padrão: barra 6000mm, pontas 10mm, corte 10mm, reúso a partir de 300mm */
        public static CutParameters defaults() {
            return new CutParameters(6000, 10, 10, 300);
        }
    }

    // -------------------------------------------------------------------------
    // Otimizador
    // -------------------------------------------------------------------------

    private final CutParameters params;

    public CuttingOptimizer(CutParameters params) {
        this.params = params;
    }

    public CuttingOptimizer() {
        this(CutParameters.defaults());
    }

    /**
     * Otimiza o corte de um único perfil.
     *
     * @param profileCode código do perfil (ex: 11010)
     * @param requests    lista de peças solicitadas
     * @param remnants    retalhos pré-existentes deste perfil (pode ser lista vazia)
     * @return resultado com plano de corte
     */
    public CutResult optimize(int profileCode,
                              List<PieceRequest> requests,
                              List<Remnant> remnants) {

        // 1. Expande quantidades → lista plana de peças individuais
        List<AllocatedPiece> pieces = requests.stream()
                .flatMap(req -> IntStream.range(0, req.quantity())
                        .mapToObj(i -> new AllocatedPiece(req.jobCode(), req.partCode(), req.length())))
                .sorted(Comparator.comparingInt(AllocatedPiece::length).reversed()) // FFD: maior primeiro
                .collect(Collectors.toList());

        // 2. Valida: nenhuma peça pode ser maior que a barra
        pieces.forEach(p -> {
            if (p.length() > params.barLength() - params.endWaste()) {
                throw new IllegalArgumentException(
                        "Peça " + p.partCode() + " (" + p.length() + "mm) excede a barra útil (" +
                                (params.barLength() - params.endWaste()) + "mm)");
            }
        });

        // 3. Monta lista de "recipientes" disponíveis: retalhos primeiro
        List<Bar> bars = new ArrayList<>();
        remnants.stream()
                .sorted(Comparator.comparingInt(Remnant::availableLength).reversed())
                .map(Bar::new)
                .forEach(bars::add);

        // 4. FFD: encaixa cada peça
        for (AllocatedPiece piece : pieces) {
            boolean allocated = false;

            // Tenta barras/retalhos já abertos (First Fit)
            for (Bar bar : bars) {
                if (bar.tryAllocate(piece, params.cutWaste())) {
                    allocated = true;
                    break;
                }
            }

            // Não coube: abre nova barra
            if (!allocated) {
                Bar newBar = new Bar(params.barLength(), params.endWaste());
                newBar.tryAllocate(piece, params.cutWaste()); // sempre cabe (validado acima)
                bars.add(newBar);
            }
        }

        // 5. Remove barras vazias (retalhos que não foram usados → devolvem à lista de remanescentes)
        List<Bar> unusedRemnantBars = bars.stream()
                .filter(b -> b.isRemnant && b.getPieces().isEmpty())
                .collect(Collectors.toList());

        List<Bar> usedBars = bars.stream()
                .filter(b -> !b.getPieces().isEmpty())
                .collect(Collectors.toList());

        // 6. Calcula sobras reaproveitáveis das barras usadas
        List<Remnant> leftoverRemnants = new ArrayList<>();

        // Devolve retalhos pré-existentes não utilizados integralmente
        unusedRemnantBars.forEach(b ->
                leftoverRemnants.add(new Remnant(b.remnantSourceId, b.originalLength)));

        // Sobras das barras usadas que atingem o mínimo reaproveitável → viram novos retalhos
        usedBars.forEach(b -> {
            if (b.getWaste() >= params.minReusableLength()) {
                // ID do novo retalho: se era retalho, reaproveita o id original; senão usa o id da barra
                String newRemnantId = b.isRemnant
                        ? b.remnantSourceId + "_r"
                        : b.barId + "_sobra";
                leftoverRemnants.add(new Remnant(newRemnantId, b.getWaste()));
            }
        });

        // 7. Estatísticas
        // Perda REAL = apenas o que não virou retalho reaproveitável (abaixo do minReusableLength)
        long newBarsCount     = usedBars.stream().filter(b -> !b.isRemnant).count();
        long remnantBarsCount = usedBars.stream().filter(b -> b.isRemnant).count();
        int  totalMaterial    = (int)(newBarsCount * params.barLength()
                + usedBars.stream().filter(b -> b.isRemnant)
                .mapToInt(b -> b.originalLength).sum());
        // Sobra que virou retalho não é perda
        int  totalReusable    = leftoverRemnants.stream().mapToInt(Remnant::availableLength).sum();
        int  totalWaste       = totalMaterial - usedBars.stream()
                .mapToInt(Bar::getUsedLength).sum() - totalReusable;
        totalWaste            = Math.max(totalWaste, 0);
        double wastePercent   = totalMaterial == 0 ? 0 :
                Math.round(totalWaste * 10000.0 / totalMaterial) / 100.0;

        return new CutResult(
                profileCode,
                Collections.unmodifiableList(usedBars),
                Collections.unmodifiableList(leftoverRemnants),
                (int) newBarsCount,
                (int) remnantBarsCount,
                totalWaste,
                wastePercent
        );
    }

    // -------------------------------------------------------------------------
    // Processamento paralelo com Virtual Threads (Java 21+)
    // -------------------------------------------------------------------------

    /**
     * Processa múltiplos perfis em paralelo usando Virtual Threads.
     *
     * @param jobs mapa profileCode → (requests, remnants)
     * @return mapa profileCode → CutResult
     */
    public Map<Integer, CutResult> optimizeAll(
            Map<Integer, Map.Entry<List<PieceRequest>, List<Remnant>>> jobs) {

        Map<Integer, CutResult> results = new ConcurrentHashMap<>();

        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<?>> futures = jobs.entrySet().stream()
                    .map(entry -> executor.submit(() -> {
                        int code = entry.getKey();
                        var requests = entry.getValue().getKey();
                        var remnants = entry.getValue().getValue();
                        results.put(code, optimize(code, requests, remnants));
                    }))
                    .collect(Collectors.toList());

            // Aguarda todos
            for (Future<?> f : futures) {
                try { f.get(); }
                catch (InterruptedException | ExecutionException e) {
                    throw new RuntimeException("Erro ao processar perfil", e);
                }
            }
        }

        return results;
    }

    // -------------------------------------------------------------------------
    // Utilitário: formata resultado como texto legível
    // -------------------------------------------------------------------------

    public static String formatResult(CutResult result) {
        StringBuilder sb = new StringBuilder();
        sb.append("=== Perfil %d ===\n".formatted(result.profileCode()));
        sb.append("Barras novas usadas  : %d\n".formatted(result.totalBarsUsed()));
        sb.append("Retalhos aproveitados: %d\n".formatted(result.totalRemnantBarsUsed()));
        sb.append("Perda real           : %dmm (%.2f%%) — exclui sobras reaproveitáveis\n\n"
                .formatted(result.totalWasteMm(), result.wastePercent()));

        for (Bar bar : result.bars()) {
            String origem = bar.isRemnant
                    ? "(retalho %s | %dmm)".formatted(bar.remnantSourceId, bar.originalLength)
                    : "(nova barra | %dmm)".formatted(bar.originalLength);
            String sobraLabel = bar.getWaste() > 0
                    ? "sobra: %dmm".formatted(bar.getWaste())
                    : "sem sobra";
            sb.append("  [%s] %s | útil usado: %dmm | %s\n"
                    .formatted(bar.barId, origem, bar.getUsedLength(), sobraLabel));
            for (AllocatedPiece p : bar.getPieces()) {
                sb.append("      %-6s | %-8s | %dmm\n"
                        .formatted(p.jobCode(), p.partCode(), p.length()));
            }
        }

        if (!result.leftoverRemnants().isEmpty()) {
            sb.append("\n  Retalhos reaproveitáveis gerados:\n");
            result.leftoverRemnants().forEach(r ->
                    sb.append("    %-20s → %dmm\n".formatted(r.remnantId(), r.availableLength())));
        }

        return sb.toString();
    }

    // -------------------------------------------------------------------------
    // Exemplo de uso / smoke test
    // -------------------------------------------------------------------------

    public static void main(String[] args) {
        // Reseta contador de barras para o exemplo
        Bar.counter = 1;

        var optimizer = new CuttingOptimizer(CutParameters.defaults());

        List<PieceRequest> requests = List.of(
                new PieceRequest("J01", 2, "P001", 300),
                new PieceRequest("J01", 2, "P002", 1510),
                new PieceRequest("J01", 8, "P003", 550),
                new PieceRequest("J01", 2, "P004", 3560),
                new PieceRequest("J01", 1, "P005", 5000)
        );

        // Simula um retalho pré-existente de sessão anterior
        List<Remnant> remnants = List.of(
                new Remnant("R001", 1800)
        );

        CutResult result = optimizer.optimize(11010, requests, remnants);
        System.out.println(formatResult(result));
    }
}