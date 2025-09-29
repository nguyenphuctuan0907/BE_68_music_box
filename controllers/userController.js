const User = require("../models/user")

exports.createUser = async (req, res) => {
    try {
        const { name, phone, birthday } = req.body

        // Valid
        if (!name || !phone)
            return res.status(400).json({
                code: 400,
                error: "Thông tin tên và số điện thoại là bắt buộc. Vui lòng cung cấp đầy đủ thông tin!",
            })

        const newUser = new User({ name, phone, birthday })
        const user = await newUser.save()

        res.status(200).json({
            code: 200,
            data: user,
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error })
    }
}

exports.updateUser = async (req, res) => {
    try {
        const { name, phone, birthday } = req.body

        // Valid
        if (!name || !phone)
            return res.status(400).json({
                code: 400,
                error: "Thông tin tên và số điện thoại là bắt buộc. Vui lòng cung cấp đầy đủ thông tin!",
            })

        const newUser = User.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { name, phone, birthday } }
        )
        res.status(200).json({
            code: 200,
            data: newUser,
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error })
    }
}
