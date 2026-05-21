const jwt = require('jsonwebtoken')

const User = require('../models/User')



// PROTECT ROUTE

exports.protect = async (req, res, next) => {

  try {

    let token



    // GET TOKEN

    if (

      req.headers.authorization &&

      req.headers.authorization.startsWith('Bearer')

    ) {

      token =
        req.headers.authorization.split(' ')[1]
    }



    // NO TOKEN

    if (!token) {

      return res.status(401).json({

        message: 'Not authorized'

      })
    }



    // VERIFY TOKEN

    const decoded = jwt.verify(

      token,

      process.env.JWT_SECRET

    )



    // FIND USER

    const user =
      await User.findById(decoded.id)

        .select('-password')



    if (!user) {

      return res.status(404).json({

        message: 'User not found'

      })
    }



    // SAVE USER

    req.user = user



    next()

  } catch (err) {

    console.error(err)

    return res.status(401).json({

      message: 'Token failed'

    })
  }
}





// AUTHORIZE ROLE

exports.authorize = (...roles) => {

  return (req, res, next) => {

    if (

      !roles.includes(req.user.role)

    ) {

      return res.status(403).json({

        message: 'Not authorized'

      })
    }



    next()
  }
}