// =========================
// FILTROS
// =========================

const categoryButtons =
    document.querySelectorAll(".category-button");

const productCards =
    document.querySelectorAll(".product-card");

const productSections =
    document.querySelectorAll(
        "#sabonetes, #kits, #lembrancinhas"
    );


categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        const selectedCategory =
            button.dataset.category;


        // Botão ativo

        categoryButtons.forEach(btn => {

            btn.classList.remove("active");

        });

        button.classList.add("active");


        // Categorias

        productSections.forEach(section => {

            if (
                selectedCategory === "todos" ||
                section.id === selectedCategory
            ) {

                section.style.display = "block";

            } else {

                section.style.display = "none";

            }

        });


        // Produtos

        productCards.forEach(card => {

            const cardCategory =
                card.dataset.category;


            if (
                selectedCategory === "todos" ||
                cardCategory === selectedCategory
            ) {

                card.style.display = "block";

            } else {

                card.style.display = "none";

            }

        });

    });

});




// =========================
// ADICIONAR À ENCOMENDA
// =========================

const orderButtons = document.querySelectorAll(".order-button");

orderButtons.forEach(button => {
    button.addEventListener("click", () => {

        // Links como "Ver opções" não adicionam produtos.
        if (button.tagName.toLowerCase() === "a") {
            return;
        }

        const productCard = button.closest(
            ".product-card, .product-info"
        );

        const productName =
            button.dataset.product ||
            productCard?.querySelector("h3")?.textContent.trim();

        let productPrice = Number(button.dataset.price || 0);

        // Lê todas as opções selecionadas.
        const optionFields = productCard
            ? productCard.querySelectorAll(".order-option")
            : [];

        const selectedOptions = [];

        for (const field of optionFields) {
            if (!field.value.trim()) {
                alert("Escolha todas as opções antes de adicionar à encomenda.");
                field.focus();
                return;
            }

            const selectedLabel =
                field.options[field.selectedIndex].text.trim();

            selectedOptions.push(selectedLabel);
        }

        if (!productName) {
            alert("Não foi possível identificar o produto.");
            return;
        }

        // Calcula o preço do Coração e do Ursinho pela quantidade.
        if (
            productName === "Coração com cor" ||
            productName === "Ursinho Mini"
        ) {
            const quantidadeSelecionada = selectedOptions.find(option =>
                option.includes("unidades") && option.includes("R$")
            );

            const precoSelecionado = quantidadeSelecionada?.match(
                /R\$\s*([\d.,]+)/
            );

            if (!precoSelecionado) {
                alert("Não foi possível identificar o preço da quantidade escolhida.");
                return;
            }

            productPrice = Number(
                precoSelecionado[1].replace(",", ".")
            );
        }

        // Salva o produto na encomenda.
        let order = JSON.parse(localStorage.getItem("order")) || [];

        order.push({
            name: productName,
            price: productPrice,
            options: selectedOptions
        });

        localStorage.setItem("order", JSON.stringify(order));

        alert("Produto adicionado à encomenda!");

        console.log("Produto adicionado:", productName, selectedOptions);
    });
});


// =========================
// ENCOMENDA
// =========================

const orderList =
    document.querySelector("#order-list");


if (orderList) {


    let order =
        JSON.parse(
            localStorage.getItem("order")
        ) || [];


    // Limpa a área

    orderList.innerHTML = "";


    // =========================
    // ENCOMENDA VAZIA
    // =========================

    if (order.length === 0) {

        const emptyMessage =
            document.createElement("div");

        emptyMessage.classList.add(
            "empty-order"
        );


        emptyMessage.innerHTML = `

            <h3>Sua encomenda está vazia.</h3>

            <p>
                Escolha alguns produtos para
                começar sua encomenda.
            </p>

            <a href="index.html#sabonetes">
                Ver produtos
            </a>

        `;


        orderList.appendChild(
            emptyMessage
        );


    } else {


        // =========================
        // QUANTIDADES
        // =========================

        const quantities = {};

order.forEach(product => {
    const productName = product.name;
    const options = Array.isArray(product.options)
        ? product.options.join(" | ")
        : "";

    // Produtos com opções diferentes ficam separados.
    const productKey = `${productName}|||${options}`;

    if (!quantities[productKey]) {
        quantities[productKey] = {
            name: productName,
            options: options,
            quantity: 0,
            price: Number(product.price) || 0
        };
    }

    quantities[productKey].quantity++;
});



        // =========================
// PRODUTOS
// =========================

Object.keys(quantities).forEach(productKey => {

    const productData = quantities[productKey];
    const productName = productData.name;
    const productOptions = productData.options;
    const quantity = productData.quantity;
    const price = productData.price;

    const item = document.createElement("div");
    item.classList.add("order-item");

    // Guardamos a identificação completa do produto.
    item.dataset.productKey = productKey;

    item.innerHTML = `
        <div class="order-product">
            <h3>${productName}</h3>

            ${productOptions
                ? `<p class="order-options-summary">${productOptions}</p>`
                : ""}

            <span>
                R$ ${price.toFixed(2).replace(".", ",")}
            </span>
        </div>

        <div class="quantity-control">
            <button class="quantity-minus">−</button>
            <span>${quantity}</span>
            <button class="quantity-plus">+</button>
        </div>

        <button class="remove-button">Remover</button>
    `;

    orderList.appendChild(item);
});



        // =========================
        // TOTAL
        // =========================

        let total = 0;


       order.forEach(product => {
    total += Number(product.price) || 0;
});

        const totalElement =
            document.createElement("div");


        totalElement.classList.add(
            "order-total"
        );


        totalElement.innerHTML = `

            <h3>
                Total:
                R$ ${total
                    .toFixed(2)
                    .replace(".", ",")}
            </h3>

        `;


        orderList.appendChild(
            totalElement
        );



        // =========================
        // FINALIZAR
        // =========================

        const finishButton =
            document.createElement("button");


        finishButton.classList.add(
            "finish-order-button"
        );


        finishButton.textContent =
            "Finalizar encomenda";


        orderList.appendChild(
            finishButton
        );



       
        // =========================
        // FINALIZAR ENCOMENDA
        // =========================

        finishButton.addEventListener("click", () => {
            let message = "Olá! Gostaria de fazer uma encomenda:\n\n";

            Object.keys(quantities).forEach(productKey => {
                const product = quantities[productKey];

                message += `${product.quantity}x ${product.name}`;

                if (product.options) {
                    message += ` (${product.options})`;
                }

                message += ` - R$ ${(product.price * product.quantity)
                    .toFixed(2)
                    .replace(".", ",")}\n`;
            });

            message += `\nTotal: R$ ${total
                .toFixed(2)
                .replace(".", ",")}`;

            const whatsappNumber = "5511947053733";
            const whatsappLink =
                `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

            window.open(whatsappLink, "_blank");
        });

        // =========================
        // BOTÃO +
        // =========================

        const plusButtons = orderList.querySelectorAll(".quantity-plus");

        plusButtons.forEach(button => {
            button.addEventListener("click", () => {
                const item = button.closest(".order-item");
                const productKey = item.dataset.productKey;

                const product = order.find(product => {
                    const options = Array.isArray(product.options)
                        ? product.options.join(" | ")
                        : "";

                    return `${product.name}|||${options}` === productKey;
                });

                if (product) {
                    order.push({
                        name: product.name,
                        price: Number(product.price) || 0,
                        options: product.options || []
                    });

                    localStorage.setItem("order", JSON.stringify(order));
                    location.reload();
                }
            });
        });

        // =========================
        // BOTÃO -
        // =========================

        const minusButtons = orderList.querySelectorAll(".quantity-minus");

        minusButtons.forEach(button => {
            button.addEventListener("click", () => {
                const item = button.closest(".order-item");
                const productKey = item.dataset.productKey;

                const index = order.findIndex(product => {
                    const options = Array.isArray(product.options)
                        ? product.options.join(" | ")
                        : "";

                    return `${product.name}|||${options}` === productKey;
                });

                if (index !== -1) {
                    order.splice(index, 1);
                    localStorage.setItem("order", JSON.stringify(order));
                    location.reload();
                }
            });
        });

        // =========================
        // REMOVER PRODUTO
        // =========================

        const removeButtons = orderList.querySelectorAll(".remove-button");

        removeButtons.forEach(button => {
            button.addEventListener("click", () => {
                const item = button.closest(".order-item");
                const productKey = item.dataset.productKey;

                order = order.filter(product => {
                    const options = Array.isArray(product.options)
                        ? product.options.join(" | ")
                        : "";

                    return `${product.name}|||${options}` !== productKey;
                });

                localStorage.setItem("order", JSON.stringify(order));
                location.reload();
            });
        });

    }
}
