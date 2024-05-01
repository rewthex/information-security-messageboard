const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

let testThreadId = "";
let testThreadId2 = "";
let testReplyId = "";
let testReplyId2 = "";

suite("Functional Tests", function () {
	test("Creating a new thread: POST request to /api/threads/{board}", (done) => {
		chai
			.request(server)
			.post("/api/threads/board")
			.send({
				text: "sample thread",
				delete_password: "delete password",
			})
			.end((err, res) => {
				assert.equal(res.status, 200);
				done();
			});
	});

	test("Creating a new thread: POST request to /api/threads/{board}", (done) => {
		chai
			.request(server)
			.post("/api/threads/board")
			.send({
				text: "sample thread two",
				delete_password: "delete password",
			})
			.end((err, res) => {
				assert.equal(res.status, 200);
				done();
			});
	});

	test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", (done) => {
		chai
			.request(server)
			.get("/api/threads/board")
			.end((err, res) => {
				assert.equal(res.status, 200);
				testThreadId = res.body[0]._id;
				testThreadId2 = res.body[1]._id;
				done();
			});
	});

	test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", (done) => {
		chai
			.request(server)
			.delete("/api/threads/board")
			.send({
				thread_id: testThreadId,
				delete_password: "incorrect password",
			})
			.end((err, res) => {
				assert.equal(res.status, 200);
				assert.equal(res.text, "incorrect password");
				done();
			});
	});

	test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", (done) => {
		chai
			.request(server)
			.delete("/api/threads/board")
			.send({
				thread_id: testThreadId,
				delete_password: "delete password",
			})
			.end((err, res) => {
				assert.equal(res.status, 200);
				assert.equal(res.text, "success");
				done();
			});
	});

	test("Reporting a thread: PUT request to /api/threads/{board}", (done) => {
		chai
			.request(server)
			.put("/api/threads/board")
			.send({ report_id: testThreadId2 })
			.end((err, res) => {
				assert.equal(res.status, 200);
				assert.equal(res.text, "reported");
				done();
			});
	});

	test("Creating a new reply: POST request to /api/replies/{board}", (done) => {
		chai
			.request(server)
			.post("/api/replies/board")
			.send({
				thread_id: testThreadId2,
				text: "test reply",
				delete_password: "delete reply",
			})
			.end((err, res) => {
				assert.equal(res.status, 200);
				done();
			});
	});

    test("Creating a new second reply: POST request to /api/replies/{board}", (done) => {
		chai
			.request(server)
			.post("/api/replies/board")
			.send({
				thread_id: testThreadId2,
				text: "test reply",
				delete_password: "delete reply",
			})
			.end((err, res) => {
				assert.equal(res.status, 200);
				done();
			});
	});

	test("Viewing a single thread with all replies: GET request to /api/replies/{board}", (done) => {
		chai
			.request(server)
			.get("/api/replies/board")
			.query({ thread_id: testThreadId2 })
			.end((err, res) => {
				assert.equal(res.status, 200);
				assert.isArray(res.body.replies);
				testReplyId = res.body.replies[0]._id;
                testReplyId2 = res.body.replies[1]._id;
				done();
			});
	});

	test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", (done) => {
		chai
			.request(server)
			.delete("/api/replies/board")
			.send({
				thread_id: testThreadId2,
				reply_id: testReplyId,
				delete_password: "incorrect password",
			})
			.end((err, res) => {
				assert.equal(res.status, 200);
				assert.equal(res.text, "incorrect password");
				done();
			});
	});
	
    test("Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", (done) => {
        chai
            .request(server)
            .delete("/api/replies/board")
            .send({
                thread_id: testThreadId2,
                reply_id: testReplyId,
                delete_password: "delete reply",
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, "success");
                done();
            });
    });

    test("Reporting a reply: PUT request to /api/replies/{board}", (done) => {
        chai
            .request(server)
            .put("/api/replies/board")
            .send({
                thread_id: testThreadId2,
                reply_id: testReplyId2,
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, "reported")
                done();
            });
    });
    
});
