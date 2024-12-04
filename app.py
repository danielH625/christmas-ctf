from flask import Flask, render_template, request, jsonify, send_from_directory

app = Flask(__name__)

# Store flags securely
correct_flags = {
    "crypto1": "flag{crypo_is_easy}",
    "crypto2": "flag{sm3ll5_1ik3_vin3g3r}",
    "forensics1": "flag{C4n_Y0u_S33_m3_fully}",
    "forensics2": "flag{tw0_fi13_7yp3s_in_0n3}",
    "web1": "flag{s3cr3ts_@r3_n0_fun}",
    "web2": "flag{admin_acc3s5}"
}
# Store challenge states
solved_flags = {key: False for key in correct_flags}

@app.route("/")
def index():
    return render_template("index.html", solved_flags=solved_flags)

@app.route("/challenge_data/<challenge_id>")
def challenge_data(challenge_id):
    challenges = {
    "crypto1": {
        "name": "13",
        "description": """See, cryptography isn't too hard.<br>
        Enter the decoded flag below to complete the challenge:<br>
        <br>synt{pelcb_vf_rnfl}""",
        "download": None,
        "hidden_link": None
    },
    "crypto2": {
        "name": "Vinegar",
        "description": """We came across these weird looking texts with a password: very. See if you can figure out the flag.<br>
        P.S I heard the encryption smells like vinegar?""",
        "download": "/downloads/weird-text.txt",
        "hidden_link": None
    },
    "forensics1": {
        "name": "Redacted",
        "description": """This report has some sensitive information in it, some of which<br>
        have been redacted correctly, while some were not.<br>
        Can you find the flag that was not redacted properly?""",
        "download": "/downloads/redacted.pdf",
        "hidden_link": None
    },
    "forensics2": {
        "name": "Odd Combination",
        "description": """Your boss got word that the company received a suspicious file.<br>
        They've done some analyzing and are getting some conflicting information on what<br>
        type of file it is. They gave it to you as the forensic expert.<br>
        Can you extract all the information from this strange file?""",
        "download": "/downloads/flag2_of_2.pdf",
        "hidden_link": None
    },
    "web1": {
        "name": "Secrets",
        "description": """Looks like someone has been investigating the various base encryptions.<br>
        I heard they hid a flag somewhere within the website.<br>
        Can you find the flag hidden within?""",
        "download": None,
        "hidden_link": "https://danielh625.github.io/base_site/"
    },
    "web2": {
        "name": "Admin Portal",
        "description": """I'm writing a webpage for admins to check on their flags, can you do me a<br>
        favor and check it out to make sure there aren't any issues?<br>
        (Please be patient, this site takes a few seconds to load)""",
        "download": None,
        "hidden_link": "https://ctf-challenge-xsgi.onrender.com"
    }
}

    challenge = challenges.get(challenge_id)
    if challenge:
        return jsonify({
            "name": challenge["name"],
            "description": challenge["description"],
            "encrypted_flag": challenge.get("encrypted_flag"),
            "download": challenge.get("download"),
            "hidden_link": challenge.get("hidden_link"),
        })
    return jsonify({"error": "Challenge not found."}), 404

@app.route("/submit", methods=["POST"])
def submit_flag():
    data = request.json  # Get JSON payload
    challenge_id = data.get("challenge_id")  # Extract challenge ID
    flag = data.get("flag")  # Extract submitted flag

    if challenge_id in correct_flags and flag == correct_flags[challenge_id]:
        solved_flags[challenge_id] = True
        return jsonify({"message": "Correct flag!", "solved": True})
    return jsonify({"message": "Incorrect flag.", "solved": False})

@app.route("/reset", methods=["POST"])
def reset_flags():
    for key in solved_flags:
        solved_flags[key] = False
    return jsonify({"message": "All challenges have been reset."})

@app.route("/downloads/<path:filename>")
def download_file(filename):
    return send_from_directory("downloads", filename, as_attachment=True)

@app.route("/get_solved", methods=["GET"])
def get_solved():
    return jsonify({"solved_flags": solved_flags})


if __name__ == "__main__":
    app.run(debug=True)
