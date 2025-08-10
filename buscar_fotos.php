<?php
// buscar_fotos.php (Versão Final com Busca Recursiva)

// 1. Defina o diretório RAIZ onde as pastas com fotos estão
$diretorioRaiz = 'img/';

// --- Início da nova lógica de busca ---

$arquivos = []; // Array para guardar os caminhos das fotos encontradas

// Verifica se o diretório raiz realmente existe
if (is_dir($diretorioRaiz)) {
    // Cria um "iterador" que entra em todas as subpastas
    $iteradorDeDiretorio = new RecursiveDirectoryIterator($diretorioRaiz, RecursiveDirectoryIterator::SKIP_DOTS);
    $iteradorDeArquivos = new RecursiveIteratorIterator($iteradorDeDiretorio, RecursiveIteratorIterator::LEAVES_ONLY);

    // Cria um filtro para pegar apenas arquivos de imagem (insensível a maiúsculas/minúsculas graças ao '/i')
    $arquivosDeImagem = new RegexIterator($iteradorDeArquivos, '/\.(jpg|jpeg|png|gif)$/i');

    foreach ($arquivosDeImagem as $arquivo) {
        // Adiciona o caminho do arquivo ao nosso array. str_replace para garantir barras corretas em qualquer sistema.
        $arquivos[] = str_replace('\\', '/', $arquivo->getPathname());
    }
}
// --- Fim da nova lógica de busca ---


// 3. Embaralhe o array de arquivos para garantir a aleatoriedade
shuffle($arquivos);

// 4. Pegue um número limitado de fotos (ex: 10)
$fotosSelecionadas = array_slice($arquivos, 0, 10);

// 5. Formate o array para a estrutura JSON que o JavaScript espera
$respostaJson = [];
if (!empty($fotosSelecionadas)) {
    foreach ($fotosSelecionadas as $foto) {
        $respostaJson[] = ['caminho_arquivo' => $foto];
    }
}

// 6. Retorne os dados como JSON
header('Content-Type: application/json');
echo json_encode($respostaJson);

?>