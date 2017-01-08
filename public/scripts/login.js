const modalText = `
        <div id="modal" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title"></h4>
                    </div>
                    <div class="modal-body">
                    </div>
                    <div id="error" class="alert alert-danger">
                    </div>
                </div>
            </div>
        </div>
        `

function sendData(e, where, $error, $modal) {
    e.preventDefault();
    const data = $(e.target).serializeArray();
    Promise.resolve(
        $.ajax({
            url: '/ajax/' + where,
            method: 'POST',
            data,
            dataType: 'json',
            headers: { 'csrf-token': $('[name="_csrf"]').val() }
        })
    )
        .then(json => {
            if (json.success) {
                if(where == "login") {
                    $('#navContainer').load('/ #navContainer', function () {
                        $modal.modal('hide');
                    });
                } else {
                    $modal.modal('hide');
                }
            } else {
                $error.show().text('Data format not good!');
            }
        })
        .catch(err => console.log(err));
}

function loginOrRegister(e, which) {
    e.preventDefault();
    const $modal = $("#modal");
    if ($modal.length > 0) {
        const $form = $modal.find(".modal-body");
        $form.load('/'+ which + ' form', function () {
            const legend = $form.find("legend").text();
            $form.find("legend").hide();
            $modal.find(".modal-title").text(legend);
            $modal.modal('show')
            const $error = $modal.find("#error").hide();
            $form.off("submit").on('submit', function (e) {
                sendData(e, which, $error, $modal);
            });
        });
    } else {
        const $modal = $(modalText)
        const $form = $modal.find(".modal-body");
        $form.load('/' + which + ' form', function () {
            const legend = $form.find("legend").text();
            $form.find("legend").hide();
            $modal.find(".modal-title").text(legend);
            $modal.modal('show')
            const $error = $modal.find("#error").hide();
            $form.off("submit").on('submit', function (e) {
                sendData(e, which, $error, $modal);
            });
        });
    }
}

$("a[href='/login']").on('click', function (e) {
    loginOrRegister(e, "login");
})

$("a[href='/register']").on('click', function (e) {
    loginOrRegister(e, "register");
})