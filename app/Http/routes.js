'use strict'

const Route = use('Route')

Route.group('clans', function () {
    Route.get('/donation', 'ClanController.donate').middleware('auth');
    Route.get('/invite', 'ClanController.invite').middleware('auth');
    Route.get('/requests', 'ClanController.requests').middleware('auth');
    Route.get('/details', 'ClanController.details');
    Route.get("/kick", "ClanController.kick").middleware("auth");
    Route.get("/promote", "ClanController.promote").middleware('auth');

    Route.post('/donation', 'ClanController.doDonate').middleware('auth');
    Route.post('/invite', 'ClanController.doInvite').middleware('auth');
    Route.post("/requests", "ClanController.accept").middleware('auth');
    Route.post("/kick", "ClanController.doKick").middleware("auth");
    Route.post("/promote", "ClanController.doPromote").middleware('auth');
    Route.post('/details', 'UpgradeController.purchase').middleware('auth');

}).prefix('/clans/:clan_name')

Route.group('ajax', function () {
    Route.post('/clans/:clan_name/details', 'UpgradeController.ajaxPurchase').middleware('auth');
    Route.post("/login", "UserController.ajaxLogin");
    Route.post("/shop", "ItemController.ajaxBuy").middleware("auth");
    Route.post("/quests/:quest_id/complete", "QuestController.ajaxComplete").middleware("auth");
    Route.post("/register", "UserController.ajaxRegister");
}).prefix('/ajax')

Route.group('players', function () {
    Route.get('/invites', 'PlayerController.invites').middleware('auth');
    Route.get('/ask', 'PlayerController.ask').middleware('auth');
    Route.get('/details', 'PlayerController.details');

    Route.post('/details', 'ItemController.sell').middleware('auth');
    Route.post('/invites', 'PlayerController.join').middleware('auth');
    Route.post("/ask", "PlayerController.doAsk").middleware('auth')
}).prefix('/players/:user_name')

Route.get('/', 'ClanController.index');
Route.get('/create_clan', 'ClanController.create').middleware('auth');
Route.get('/login', 'UserController.login');
Route.get('/register', 'UserController.register');
Route.get('/logout', 'UserController.logout');
Route.get('/shop', 'ItemController.index').middleware('auth');
Route.get('/quests', 'QuestController.index').middleware('auth');
Route.get('/quests/:quest_id', 'QuestController.accept').middleware('auth');
Route.get('/quests/:quest_id/battle', 'QuestController.battle').middleware('auth');

Route.post('/login', 'UserController.doLogin');
Route.post('/create_clan', 'ClanController.doCreate').middleware('auth');
Route.post('/register', 'UserController.doRegister');
Route.post('/shop', 'ItemController.buy').middleware('auth');
Route.post('/quests/:quest_id', 'QuestController.complete').middleware('auth')
