const Wardrobe = require('../models/wardrobe.model');
const Garment = require('../models/garment.model');

// Dica: você pode usar req.user para acessar informações do usuário que está fazendo a request.

exports.getAll = async (req, res) => {
    // Essa rota deve retornar todos os guarda-roupas *que pertencem ao usuário*.
    // Não é necessário popular as referências para as roupas (garments).

    // Você pode escolher como retornar os dados, contanto que todas as informações
    // dos guarda-roupas estejam presentes.

    // Pesquise qual deve ser o código de retorno HTTP quando a requisição foi bem sucedida.
    try {
        console.log(req.query)
        const { skip = 0, limit = 20 } = req.query;

        if(limit > 50)
            return res.status(400).send({ message: "BAD_REQUEST: Limit shoud not be bigger than 50"})
        
        const wardrobes = await Wardrobe
                .find({owner: req.user}, {garments: 0}) // remove o campo garments do select 
                .sort({ createdAt: -1 })
                .skip(parseInt(skip))
                .limit(parseInt(limit));

        const amountOfWardrobes = await Wardrobe.countDocuments({owner: req.user});

        res.status(200).send({
            totalAmount: amountOfWardrobes,
            retrievedAmount: wardrobes.length,
            data: wardrobes
        });
    }
    catch(err) {
        console.error(err, err.message, err.stack);

        return res.status(500).send({
            message: "Error retrieving wardrobes"
        });
    }
};

exports.getById = async (req, res) => {
    // Essa rota deve retornar todas as informações de um guarda-roupas *se ele pertencer ao usuário*.
    // Nesse caso, você deve popular as referências para as roupas (garments).

    // Você pode escolher como retornar os dados, contanto que todas as informações
    // do guarda-roupas estejam presentes.

    // Pesquise qual deve ser o código de retorno HTTP quando a requisição foi bem sucedida.
    try {
        const wardrobe = await Wardrobe
                .findById(req.params.wardrobeId)
                .populate('garments');
        // Verifica se o Wardrobe existe
        if (!wardrobe){
            return res.status(404).send({
                message: "Wardrobe not found with id " + req.params.wardrobeId
            });
        }
        // Verifica se o Wardrobe pertence ao usuário
        if (wardrobe.owner != req.user._id){
            return res.status(403).send({
                message: "You can't access this Wardrobe " + req.params.wardrobeId
            });
        }

        res.status(200).send(wardrobe);
    }
    catch(err) {
        console.error(err, err.message, err.stack);

        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Wardrobe not found with id " + req.params.wardrobeId
            });
        }

        return res.status(500).send({
            message: "Error retrieving wardrobe with id " + req.params.wardrobeId
        });
    }
};

exports.create = async (req, res) => {
    // Essa rota deve criar um novo guarda-roupas no banco de dados e atribuir ele
    // ao usuário que está fazendo a requisição.

    // Você pode escolher se quer retornar as informações do guarda-roupas criado.
    // Pesquise qual deve ser o código de retorno HTTP quando um novo recurso foi criado no banco.
    try {
        const wardrobe = new Wardrobe(req.body);
        wardrobe.owner = req.user;

        await wardrobe.save();
        res.status(201).send(wardrobe);
    } catch(err) {
        console.error(err, err.message, err.stack);
        if (err.name == 'ValidationError'){
            res.status(400).send({
                message: err.message
            });
        } else
            res.status(500).send({
                message: "An error occured when creating the wardrobe."
            });
    }
};

exports.addGarment = async (req, res) => {
    // Essa rota deve adicionar uma peça de roupas (recebida através do parâmetro garmentId) 
    // ao guarda-roupas do usuário (recebido através do parâmetro wardrobeId).
        
    // Atenção: verifique se o guarda-roupas informado (wardrobeId) realmente
    //          pertence ao usuário que está fazendo a requisição.

    // Pesquise qual deve ser o código de retorno HTTP quando a requisição foi bem sucedida.
    try {
        const wardrobe = await Wardrobe.findById(req.params.wardrobeId);
        // Verifica se o Wardrobe existe
        if (!wardrobe){
            return res.status(404).send({
                message: "Wardrobe not found with id " + req.params.wardrobeId
            });
        }
        // Verifica se o Wardrobe pertence ao usuário
        if (wardrobe.owner != req.user._id){
            return res.status(403).send({
                message: "You can't make changes in this Wardrobe " + req.params.wardrobeId
            });
        }
        const garment = await Garment.findById(req.params.garmentId); 
        // Verifica se a Garment existe
        if(!garment) {
            return res.status(404).send({
                message: "Garment not found with id " + req.params.garmentId
            });
        }
        // Garante a singularidade dos Garments
        wardrobe.garments.addToSet(garment);
        wardrobe.save();
        res.status(200).send(wardrobe);
    }
    catch(err) {
        console.error(err, err.message, err.stack);

        res.status(500).send({
            message: "An error occured when creating the wardrobe."
        });
    }
};