import { useEffect, useState } from "react";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { Card as Cd, StateType } from "./@types/global.types";
import {
    addCard,
    addDir,
    changeDir,
    deleteFromFirebase,
    deleteItems,
    fetchDir,
    updateCardData,
} from "./redux/videosAction";
import {
    Breadcrumb,
    Button,
    Card,
    Checkbox,
    Col,
    Form,
    Input,
    Layout,
    Modal,
    Row,
    Typography,
} from "antd";
import {
    ArrowLeftOutlined,
    DeleteFilled,
    EditFilled,
    FileAddOutlined,
    FolderAddOutlined,
    FolderOpenOutlined,
    FolderOutlined,
} from "@ant-design/icons";

function App() {
    const dispatch = useDispatch();

    const [isVideoOpen, setIsVideoOpen] = useState(false);

    const [isCreateDirOpen, setIsCreateDirOpen] = useState(false);
    const [folderName, setFolderName] = useState("");

    const [cardValue, setCardValue] = useState<{
        name: string;
        videoURL: string;
    }>({
        name: "",
        videoURL: "",
    });

    const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);

    const [editCard, setEditCard] = useState({
        idx: 0,
        isOpen: false,
        updatedName: "",
        updatedURL: "",
        id: "",
    });

    const [currentVideo, setCurrentVideo] = useState("");
    const [currentPlayableVideo, setCurrentPlayableVideo] = useState("");

    const state: StateType = useSelector((state: StateType) => state);

    const [selectedCards, setSelectedCards] = useState<Boolean[]>([]);
    const [selectedDirs, setSelectedDirs] = useState<Boolean[]>([]);

    const [inTransit, setInTransit] = useState<{
        isMoving: Boolean;
        oldRef: string;
        moveCards: string[];
        cards: Cd[];
    }>({
        isMoving: false,
        oldRef: "",
        moveCards: [],
        cards: [],
    });

    useEffect(() => {
        let str = currentVideo;
        if (str.includes("youtube") || str.includes("youtu")) {
            let modified =
                "https://www.youtube.com/embed/" + str.split("/").pop();
            str = modified;
        }
        console.log(str);
        setCurrentPlayableVideo(str);
    }, [currentVideo]);
    useEffect(() => {
        (async () => {
            await fetchDir(dispatch, state);
        })();
    }, [state.currentDir]);

    useEffect(() => {
        console.log(selectedCards);
    }, [selectedCards]);

    const handleDelete = async () => {
        let cardIds = [];
        let dirs = [];
        for (let i = 0; i < selectedCards.length; i++) {
            if (selectedCards[i]) {
                cardIds.push(state.cards[i].id);
            }
        }
        for (let i = 0; i < selectedDirs.length; i++) {
            if (selectedDirs[i]) {
                dirs.push(state.dirs[i]);
            }
        }
        console.log("DELETING: ", dirs, cardIds);
        await deleteItems(state, dispatch, dirs, cardIds);
    };

    const handleCreateCard = async () => {
        try {
            await addCard(state, dispatch, {
                ...cardValue,
                id: "",
            });
            setCardValue({
                name: "",
                videoURL: "",
            });
            setIsCreateCardOpen(false);
        } catch (err) {
            console.log(err);
        }
    };

    const handleCreateDir = async () => {
        try {
            await addDir(state, dispatch, folderName);
            setFolderName("");
            setIsCreateDirOpen(false);
        } catch (err) {
            console.log(err);
        }
    };

    const handleEditCard = async () => {
        try {
            await updateCardData(state, dispatch, editCard.idx, {
                name: editCard.updatedName,
                videoURL: editCard.updatedURL,
                id: editCard.id,
            });
            setEditCard({
                ...editCard,
                idx: -1,
                isOpen: false,
                id: "",
                updatedName: "",
                updatedURL: "",
            });
        } catch (err) {
            console.log(err);
        }
    };

    const handleMoveCards = async () => {
        console.log("TO MOVE: ", selectedCards);

        let cardIds = [];
        let cards = [];
        for (let i = 0; i < selectedCards.length; i++) {
            if (selectedCards[i]) {
                cardIds.push("card_" + state.cards[i].id);
                cards.push(state.cards[i]);
            }
        }
        if (cardIds.length === 0) {
            return;
        }
        setInTransit({
            ...inTransit,
            isMoving: true,
            moveCards: cardIds,
            oldRef: state.currentDir.slice(1).join("/"),
            cards,
        });
    };

    const handleMoveCardsHere = async () => {
        await deleteFromFirebase(inTransit.oldRef, inTransit.moveCards);
        console.log("NEW MOVE: ", inTransit.cards);
        for (let i = 0; i < inTransit.cards.length; i++) {
            await addCard(
                state,
                dispatch,
                {
                    ...inTransit.cards[i],
                },
                false
            );
        }
        setInTransit({
            ...inTransit,
            isMoving: false,
            cards: [],
            moveCards: [],
            oldRef: "",
        });
    };

    return (
        <Layout>
            <Modal
                title="Watch a video"
                style={{
                    top: 20,
                }}
                width={800}
                open={isVideoOpen}
                onCancel={() => setIsVideoOpen(false)}
                footer={null}
                centered
            >
                <iframe
                    width="100%"
                    height="400px"
                    title="Video"
                    src={currentPlayableVideo}
                    allowFullScreen
                />
            </Modal>
            <Modal
                title="Create A Folder"
                style={{
                    top: 20,
                }}
                width={800}
                open={isCreateDirOpen}
                onCancel={() => setIsCreateDirOpen(false)}
                onOk={handleCreateDir}
                centered
            >
                <Form>
                    <Form.Item>
                        <Input
                            placeholder="Folder Name..."
                            onChange={(e) => {
                                setFolderName(e.target.value);
                            }}
                            value={folderName}
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Create A Card"
                style={{
                    top: 20,
                }}
                width={800}
                open={isCreateCardOpen}
                onCancel={() => setIsCreateCardOpen(false)}
                onOk={handleCreateCard}
                centered
            >
                <Form>
                    <Form.Item>
                        <Input
                            placeholder="Card Name..."
                            onChange={(e) => {
                                setCardValue({
                                    ...cardValue,
                                    name: e.target.value,
                                });
                            }}
                            value={cardValue.name}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Input
                            placeholder="Video URL"
                            onChange={(e) => {
                                setCardValue({
                                    ...cardValue,
                                    videoURL: e.target.value,
                                });
                            }}
                            value={cardValue.videoURL}
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Update Card"
                style={{
                    top: 20,
                }}
                width={800}
                open={editCard.isOpen}
                onCancel={() => setEditCard({ ...editCard, isOpen: false })}
                onOk={handleEditCard}
                centered
            >
                <Form>
                    <Form.Item>
                        <Input
                            placeholder="Card Name..."
                            onChange={(e) => {
                                setEditCard({
                                    ...editCard,
                                    updatedName: e.target.value,
                                });
                            }}
                            value={editCard.updatedName}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Input
                            placeholder="Video URL"
                            onChange={(e) => {
                                setEditCard({
                                    ...editCard,
                                    updatedURL: e.target.value,
                                });
                            }}
                            value={editCard.updatedURL}
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Row justify={"space-between"} style={{ padding: 20 }}>
                <Row>
                    <Col>
                        <Button
                            style={{
                                height: "100%",
                                width: "100%",
                                padding: 10,
                            }}
                            onClick={(e) => {
                                setIsCreateCardOpen(true);
                            }}
                        >
                            <FileAddOutlined
                                style={{ fontSize: 30, margin: 0 }}
                            />
                        </Button>
                    </Col>
                    <Col style={{ marginLeft: 10 }}>
                        <Button
                            style={{
                                height: "100%",
                                width: "100%",
                                padding: 10,
                            }}
                            onClick={(e) => {
                                setIsCreateDirOpen(true);
                            }}
                        >
                            <FolderAddOutlined
                                style={{ fontSize: 30, margin: 0 }}
                            />
                        </Button>
                    </Col>
                </Row>
                <Col>
                    <Row>
                        {!inTransit.isMoving && (
                            <Col style={{ marginRight: 10 }}>
                                <Button
                                    style={{
                                        height: "100%",
                                        width: "100%",
                                        padding: 10,
                                        marginRight: 10,
                                    }}
                                    onClick={handleMoveCards}
                                >
                                    Move Cards
                                </Button>
                            </Col>
                        )}
                        {inTransit.isMoving && (
                            <Col style={{ marginRight: 10 }}>
                                <Button
                                    style={{
                                        height: "100%",
                                        width: "100%",
                                        padding: 10,
                                        marginRight: 10,
                                    }}
                                    onClick={handleMoveCardsHere}
                                >
                                    Move Here
                                </Button>
                            </Col>
                        )}
                        <Col>
                            <Button
                                danger
                                style={{
                                    height: "100%",
                                    width: "100%",
                                    padding: 10,
                                }}
                                // onClick={(e) => {
                                //     console.log(selectedCards);
                                //     console.log(selectedDirs);
                                // }}
                                onClick={handleDelete}
                            >
                                <DeleteFilled
                                    style={{
                                        color: "red",
                                        fontSize: 30,
                                        margin: 0,
                                    }}
                                />
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <Layout style={{ padding: 21 }}>
                <Button
                    type="default"
                    shape="circle"
                    icon={
                        <ArrowLeftOutlined
                            style={{ color: "#fff", fontSize: 20 }}
                        />
                    }
                    onClick={() => {
                        if (state.currentDir.length > 1) {
                            changeDir(state, true, dispatch);
                        }
                    }}
                ></Button>
                <Typography style={{ fontSize: 18, marginTop: 10 }}>
                    / {state.currentDir.slice(1).join(" / ")}
                </Typography>
            </Layout>

            <Row style={{ minHeight: "85vh", padding: 40 }}>
                {state.dirs.map((val, idx) => (
                    <Col
                        style={{ margin: 10, cursor: "pointer" }}
                        key={idx}
                        onClick={() => {
                            changeDir(state, false, dispatch, val);
                        }}
                    >
                        <Card>
                            <Checkbox
                                style={{
                                    position: "absolute",
                                    left: 5,
                                    top: 5,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                onChange={(e) => {
                                    let temp = selectedDirs;
                                    if (e.target.checked) {
                                        temp[idx] = true;
                                    } else {
                                        temp[idx] = false;
                                    }
                                    setSelectedDirs(temp);
                                }}
                            />

                            <Col
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "column",
                                }}
                            >
                                <FolderOutlined style={{ fontSize: 42 }} />
                                <Typography>{val}</Typography>
                            </Col>
                        </Card>
                    </Col>
                ))}
                {state.cards.map((val, idx) => (
                    <Col style={{ margin: 10 }} key={idx}>
                        <Card>
                            <Checkbox
                                style={{
                                    position: "absolute",
                                    left: 5,
                                    top: 5,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                onChange={(e) => {
                                    let temp = selectedCards;
                                    setSelectedCards([]);
                                    if (e.target.checked) {
                                        temp[idx] = true;
                                    } else {
                                        temp[idx] = false;
                                    }
                                    console.log(temp);
                                    setSelectedCards(temp);
                                }}
                            />
                            <EditFilled
                                style={{
                                    color: "#fff",
                                    position: "absolute",
                                    top: 10,
                                    right: 10,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditCard({
                                        ...editCard,
                                        idx: idx,
                                        isOpen: true,
                                        updatedName: val.name,
                                        updatedURL: val.videoURL,
                                        id: val.id,
                                    });
                                }}
                            />
                            <Col
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "column",
                                }}
                            >
                                <Typography style={{ marginBottom: 10 }}>
                                    {val.name}
                                </Typography>
                                <Button
                                    onClick={(e) => {
                                        setCurrentVideo(val.videoURL);
                                        setIsVideoOpen(true);
                                    }}
                                >
                                    Watch Video
                                </Button>
                            </Col>
                        </Card>
                    </Col>
                ))}
                {state.cards.length === 0 && state.dirs.length === 0 ? (
                    <Layout
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <FolderOpenOutlined
                            style={{ fontSize: 200, color: "#fff" }}
                        />
                        <Typography style={{ fontSize: 25 }}>
                            No Data Found
                        </Typography>
                    </Layout>
                ) : (
                    ""
                )}
            </Row>
        </Layout>
    );
}

export default App;
