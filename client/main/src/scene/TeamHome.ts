class TeamHome extends BaseScene implements eui.UIComponent {

	private playerList: any = [];
	private ownerID: number = 0;
	private isLeader: boolean = false;
	private teamID: String = "";
	private leaderView;
	private userView_one;
	private userView_two;
	private userView_therr;
	private userViewList: any = [];
	private teamIDLable;
	private btnStartMatch: eui.Image;
	private startMatchTipLable;
	private startMatchCountDown: number = MatchvsData.teamStartMatchCountDown;
	private startMatchTipGroup;
	private leaveTeamGroup;
	private matchTiemOutGroup;
	private matchSuccessGroup: eui.Group;
	private isStraMatchOnClick: boolean = true;
	private back: eui.Button;
	private createTeamTip: eui.Image;
	private userListView: eui.List;
	private time = undefined;
	private par = undefined;

	private tryReconnectTimer;

	public constructor() {
		super();
	}


	protected partAdded(partName: string, instance: any): void {
		super.partAdded(partName, instance);
		switch (partName) {
			case "leader":
				this.leaderView = instance;
				this.userViewList.push(this.leaderView);
				break;
			case "user_one":
				this.userView_one = instance;
				this.userViewList.push(this.userView_one);
				break;
			case "user_two":
				this.userView_two = instance;
				this.userViewList.push(this.userView_two);
				break
			case "user_three":
				this.userView_therr = instance;
				this.userViewList.push(this.userView_therr);
				break;
			case "team_id":
				this.teamIDLable = instance;
				break;
			case "start_match":
				this.btnStartMatch = instance;
				break;
			case "start_match_tip":
				this.startMatchTipLable = instance;
				break;
			case "match_group":
				this.startMatchTipGroup = instance;
				break;
			case "leave_team_group":
				this.leaveTeamGroup = instance;
				break;
			case "match_tiem_out":
				this.matchTiemOutGroup = instance;
				break;
			case "back":
				this.back = instance;
				break;
			case "create_team_tip":
				this.createTeamTip = instance;
				break;
			case "match_success":
				this.matchSuccessGroup = instance;
				break;
			case "user_list":
				this.userListView = instance;
				break;
		}
	}
	private showLeaveTeamDialog(isVisible) {
		this.leaveTeamGroup.visible = isVisible;
	}
	public onClick(name: string, v: egret.DisplayObject) {
		switch (name) {
			case "back":
				this.showLeaveTeamDialog(true);
				break;
			case "cancel_leave_team":
				this.showLeaveTeamDialog(false);
				break;
			case "btn_leave_team":
				RombBoyMatchvsEngine.getInstance.leaveTeam();
				break;
			case "start_match":
				if (this.isStraMatchOnClick) {
					this.starMatch();
				}
				break;
			case "btn_abort_match":
				this.abortMatch();
				break;
			case "btn_to_match":
				this.matchTiemOutGroup.visible = false;
				this.starMatch();
				break;
		}
	}




	protected childrenCreated(): void {
		super.childrenCreated();
		this.initView();
		console.log("TeamHome childrenCreated:");
	}

	public initView() {
		this.teamIDLable.text = this.teamID;
		console.log('[INFO]  this.ownerID:',this.ownerID);
		this.isLeader = (this.ownerID == GameData.userID)
		for (var i = 0; i < GameData.TeamMaxPlayer; i++) {
			if (this.playerList[i] !== undefined) {
				this.playerList[i].isLeader = (i == 0);
				this.playerList[i].avatar = this.playerList[i].avatar === undefined ? this.playerList[i].userProfile : this.playerList[i].avatar;
				// this.playerList[i].avatarTex = ImageLoader.Texture(this.playerList[i].avatar);
			} else {
				var player = { avatar: "resource/assets/TeamHome/team_default_avatar.jpg", userID: "", isLeader: false };
				// player.avatarTex =  ImageLoader.Texture(player.avatar);
				this.playerList.push(player);
			}
		}
		this.userListView.dataProvider = new eui.ArrayCollection(this.playerList);
		this.userListView.itemRenderer = userListIRSkin;

		console.log('[INFO] is leader:',this.isLeader);
		this.btnStartMatch.source = this.isLeader ? "resource/assets/TeamHome/btn_start_match.png" : "resource/assets/TeamHome/wait_start_game.png";
		this.isStraMatchOnClick = this.isLeader;

	}


	public onShow(par) {
		super.onShow();
		console.log("[TeamHome] onShow:" + par);
		this.par = par;
		if (par != undefined) {
			this.playerList = par.data;
			if (par.teamID != "") {
				this.teamID = par.teamID;
			}
			this.ownerID = par.ownerID;
		}
		RomeBoyMatchvsRep.getInstance.addEventListener(MatchvsMessage.MATCHVS_TEAM_USER_INFO_NOTIFY, this.onEvent, this);
		RomeBoyMatchvsRep.getInstance.addEventListener(MatchvsMessage.MATCHVS_TEAM_MATCH_STAR, this.onEvent, this);
		RomeBoyMatchvsRep.getInstance.addEventListener(MatchvsMessage.MATCHVS_TEAM_MATCH_RESULT_NOTIFY, this.onEvent, this);
		RomeBoyMatchvsRep.getInstance.addEventListener(MatchvsMessage.MATCHVS_TEAM_NETWORKSTATE, this.onEvent, this);
		RomeBoyMatchvsRep.getInstance.addEventListener(MatchvsMessage.MATCHVS_LEVAE_ROOM, this.onEvent, this);

		RomeBoyMatchvsRep.getInstance.addEventListener(MatchvsMessage.MATCHVS_ERROR, this.onEvent, this);
		RomeBoyMatchvsRep.getInstance.addEventListener(MatchvsMessage.MATCHVS_DISCONNECTRESPONSE, this.onEvent, this);

		RomeBoyMatchvsRep.getInstance.addEventListener(MatchvsMessage.MATCHVS_RECONNECT_RSP, this.onEvent, this);

	}
	public onHide(): void {
		super.onHide();
		RomeBoyMatchvsRep.getInstance.removeEventListener(MatchvsMessage.MATCHVS_TEAM_USER_INFO_NOTIFY, this.onEvent, this);
		RomeBoyMatchvsRep.getInstance.removeEventListener(MatchvsMessage.MATCHVS_TEAM_MATCH_STAR, this.onEvent, this);
		RomeBoyMatchvsRep.getInstance.removeEventListener(MatchvsMessage.MATCHVS_TEAM_MATCH_RESULT_NOTIFY, this.onEvent, this);
		RomeBoyMatchvsRep.getInstance.removeEventListener(MatchvsMessage.MATCHVS_LEVAE_ROOM, this.onEvent, this);

		RomeBoyMatchvsRep.getInstance.removeEventListener(MatchvsMessage.MATCHVS_TEAM_NETWORKSTATE, this.onEvent, this);

		RomeBoyMatchvsRep.getInstance.removeEventListener(MatchvsMessage.MATCHVS_ERROR, this.onEvent, this);
		RomeBoyMatchvsRep.getInstance.removeEventListener(MatchvsMessage.MATCHVS_DISCONNECTRESPONSE, this.onEvent, this);
		RomeBoyMatchvsRep.getInstance.removeEventListener(MatchvsMessage.MATCHVS_RECONNECT_RSP, this.onEvent, this);
		this.tryReconnectTimer && Delay.clear(this.tryReconnectTimer);
	}

	public onEvent(e: egret.Event): void {
		var data = e.data;
		switch (e.type) {
			case MatchvsMessage.MATCHVS_TEAM_USER_INFO_NOTIFY:
				console.log("team user changed : %o" ,data);
				if (data.action === "leaveTeam" && data.player.userID === GameData.userID) {
					SceneManager.back();
				} else {
					this.playerList = data.data;
					if (data.ownerID != 0) {
						this.ownerID = data.ownerID;
					}
					this.initView();
				}
				break;
			case MatchvsMessage.MATCHVS_TEAM_MATCH_STAR:
				if (data.status === 200) {
					this.startMatchCountDown = MatchvsData.teamStartMatchCountDown;
					this.MatchCountDown(this);
				}
				break;
			case MatchvsMessage.MATCHVS_TEAM_MATCH_RESULT_NOTIFY:
				if (data.status === 200) {
					this.matchSuccess(data, this);
				} else {
					this.matchBust();
				}
				break;
			case MatchvsMessage.MATCHVS_LEVAE_ROOM:
				this.matchSuccessGroup.visible = false;
				SceneManager.back();
				break;
			case MatchvsMessage.MATCHVS_DISCONNECTRESPONSE:
				this.tryReconnect();
				break;
			case MatchvsMessage.MATCHVS_RECONNECT_RSP:
				if (data.status === 200) {
					Toast.show("重连成功");
				} else {
					Toast.show("重连失败,正在返回");
					SceneManager.back();
				}
				break;
			case MatchvsMessage.MATCHVS_TEAM_NETWORKSTATE:
				switch (data.state) {
					case 1:
						Toast.show(data.userID + "掉线了，请等待他重连");
						break;
					case 2:
						Toast.show(data.userID + "小队重连成功");
						break;
					case 3:
						Toast.show(data.userID + "重连失败");

						this.removeTeamUser(data);
						break;
				}
				break;
		}

	}
	private tryReconnect() {
		Toast.show("连接已断开" + "5S后尝试重连...");
		this.tryReconnectTimer && Delay.clear(this.tryReconnectTimer);
		this.tryReconnectTimer = Delay.run(function () {
			RombBoyMatchvsEngine.getInstance.reconnect();
		}, 5000);

	};
	private removeTeamUser(data) {
		this.ownerID = data.owner;
		for (var i = 0; i < this.playerList.length; i++) {
			if (this.playerList[i].userID == data.userID) {
				this.playerList.splice(i, 1);
				break;
			}
		}
		this.initView();
	}
	/**
	 * 开始匹配
	 */
	private starMatch() {
		if (this.par != null && this.par.roomID != null && this.par.roomID != "0") {
			Toast.show("已经在房间中");
			return;
		}
		const canWatch = 1;  //	是否可以观战 1-可以观战 2不可以观战。
		const mode = 0;      // 根据mode 进行队伍匹配
		const visibility = 1;  //匹配的房间是否可见（是否可以被getRoomListEx查看到）。0-不可见 1- 可见
		const roomProperty = ""; //房间自定义信息
		RombBoyMatchvsEngine.getInstance.TeamMatch(canWatch, mode, visibility, roomProperty);
	}

	/**
	 * 匹配倒计时
	 */
	private MatchCountDown(self) {
		this.back.visible = false;
		this.createTeamTip.visible = false;
		this.startMatchTipGroup.visible = true;
		this.startMatchTipLable.text = "正在匹配玩家：" + self.startMatchCountDown;
		if (this.isLeader) {
			this.isStraMatchOnClick = false;
			this.btnStartMatch.source = "resource/assets/TeamHome/btn_in_the_match.png";
		} else {
			this.btnStartMatch.source = "resource/assets/TeamHome/tips.png";
		}

		if (this.time !== undefined) {
			clearInterval(this.time);
			this.time = undefined;
		}
		this.time = setInterval(function () {
			self.startMatchCountDown--;
			if (self.startMatchCountDown < 0) {
				clearInterval(self.time);
				self.time = undefined;
			} else {
				self.startMatchTipLable.text = "正在匹配玩家：" + self.startMatchCountDown;
			}
		}, 1000);
	}

	/**
	 * 匹配超时
	 */
	private matchBust() {
		this.startMatchTipGroup.visible = false;
		if (this.isLeader) {
			this.matchTiemOutGroup.visible = true;
			this.btnStartMatch.source = "resource/assets/TeamHome/btn_start_match.png";
		} else {
			//打印toast
			this.back.visible = true;
			this.createTeamTip.visible = true;
			Toast.show("匹配失败，等待队长重新开始游戏");
			this.btnStartMatch.source = "resource/assets/TeamHome/wait_start_game.png";
		}
	}

	/**
	 * 匹配成功
	 */
	private matchSuccess(data, self) {
		// this.maskBg.visible = true;
		NetWork.myTeamUserList = data.brigades[0].playerList;
		NetWork.otherTeamUserList = data.brigades[1].playerList;
		let myTeamViewList = [];
		let otherTeamViewList = [];
		this.matchSuccessGroup.visible = true;
		for (var i = 2; i < 10; i++) {
			if (i > 5) {
				otherTeamViewList.push(this.matchSuccessGroup.getElementAt(i))
			} else {
				myTeamViewList.push(this.matchSuccessGroup.getElementAt(i));
			}
		}
		let ImageX = 0, ImageY = 0, ImageWidth = 61, ImageHeight = 61;
		for (var a = 0; a < NetWork.myTeamUserList.length; a++) {
			ImageLoader.showAsyncByCrossUrl(myTeamViewList[a], NetWork.myTeamUserList[a].userProfile, ImageX, ImageY, ImageWidth, ImageHeight);
			myTeamViewList[a].getElementAt(1).text = NetWork.myTeamUserList[a].userID;
			NetWork.myTeamUserList[a].teamID = 0;
			if (GameData.userID == NetWork.myTeamUserList[a].userID) {
				GameData.teamID = 0;
			}
		}
		for (var b = 0; b < NetWork.otherTeamUserList.length; b++) {
			ImageLoader.showAsyncByCrossUrl(otherTeamViewList[b], NetWork.otherTeamUserList[b].userProfile, ImageX, ImageY, ImageWidth, ImageHeight);
			otherTeamViewList[b].getElementAt(1).text = NetWork.otherTeamUserList[b].userID;
			NetWork.otherTeamUserList[b].teamID = 1;
			if (GameData.userID == NetWork.otherTeamUserList[b].userID) {
				GameData.teamID = 1;
			}
		}
		// setTimeout(function() {
		RombBoyMatchvsEngine.getInstance.sendEventEx("team", GameData.teamID);
		SceneManager.showScene(Game);
		// },1000);

	}

	/**
	 * 取消匹配
	 */
	private abortMatch() {
		this.back.visible = true;
		// this.maskBg.visible = false;
		this.createTeamTip.visible = true;
		this.matchTiemOutGroup.visible = false;
		this.startMatchTipGroup.visible = false;
		this.isStraMatchOnClick = true;
		this.btnStartMatch.source = "resource/assets/TeamHome/btn_start_match.png";
	}




}