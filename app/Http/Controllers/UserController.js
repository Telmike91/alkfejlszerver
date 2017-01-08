'use strict'

const User = use('App/Model/User');
const Player = use('App/Model/Player');
const Validator = use('Validator');
const Hash = use('Hash');
const Database = use('Database');

class UserController {
    * login(request, response) {
        yield response.sendView('login');
    }

    * ajaxRegister(request, response) {
        const registerData = request.except('_csrf');
        const rules = {
            username: 'required|alpha_numeric|unique:users',
            email: 'required|email|unique:users',
            inputPassword: 'required|min:4',
            inputPasswordAgain: 'required|same:inputPassword',
        }
        const validation = yield Validator.validateAll(registerData, rules);
        if (validation.fails()) {
            response.ok({
                success: false
            })
            return
        }

        const user = new User();
        const player = new Player();

        user.username = registerData.username
        user.email = registerData.email
        user.password = yield Hash.make(registerData.inputPassword)
        user.privilege = 1;

        player.username = registerData.username;
        player.STR = 5;
        player.VIT = 5;
        player.LCK = 5;
        player.gold = 0;

        yield user.save()
        yield player.save()

        response.ok({
            success:true
        })
    }

    * ajaxLogin(request, response) {
        const email = request.input('email')
        const password = request.input('inputPassword')

        try {
            const login = yield request.auth.attempt(email, password)

            if (login) {
                response.ok({
                    success: true
                })
                return
            }
        } catch (err) {
            response.ok({
                success: false                
            })
            return
        }
    }

    * doLogin(request, response) {
        const email = request.input('email')
        const password = request.input('inputPassword')

        try {
            const login = yield request.auth.attempt(email, password)

            if (login) {
                response.redirect('/')
                return
            }
        }
        catch (err) {
            yield request
                .withAll()
                .andWith({ errors: [err] })
                .flash()

            response.redirect('back')
            return
        }
    }

    * logout(request, response) {
        yield request.auth.logout()
        response.redirect('/')
    }

    * register(request, response) {
        yield response.sendView('register');
    }

    * doRegister(request, response) {
        const registerData = request.except('_csrf');
        const rules = {
            username: 'required|alpha_numeric|unique:users',
            email: 'required|email|unique:users',
            inputPassword: 'required|min:4',
            inputPasswordAgain: 'required|same:inputPassword',
        }
        const validation = yield Validator.validateAll(registerData, rules);
        if (validation.fails()) {
            yield request
                .withAll()
                .andWith({ errors: validation.messages() })
                .flash()

            response.redirect('back')
            return
        }

        const user = new User();
        const player = new Player();

        user.username = registerData.username
        user.email = registerData.email
        user.password = yield Hash.make(registerData.inputPassword)
        user.privilege = 1;

        player.username = registerData.username;
        player.STR = 5;
        player.VIT = 5;
        player.LCK = 5;
        player.gold = 0;

        yield user.save()
        yield player.save()

        response.redirect('/');
    }
}

module.exports = UserController
