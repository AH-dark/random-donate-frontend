import React, { useCallback, useMemo, useState } from "react";
import classes from "./style.module.scss";
import {
    Box,
    Button,
    ButtonBase,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    FormLabel,
    Paper,
    Stack,
    TextField,
    Theme,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import { blue } from "@mui/material/colors";
import type DonateInfoRequest from "model/request/donateInfoRequest";
import type ResponseData from "model/response/responseData";
import type DonateInfoResponse from "model/response/donateInfoResponse";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import { usePostDonateInfoMutation } from "services/api";
import { AxiosError } from "axios";
import clsx from "clsx";
import { useHistory } from "react-router-dom";

const accept = [".png", ".jpg", ".jpeg", ".bmp", ".gif", ".webp"];

const initData: DonateInfoRequest = {
    name: "",
    comment: "",
    qrcode: null,
    author: 0,
};

const UploadButton: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation();
    const history = useHistory();
    const [postDonateInfo, { isLoading: isPosting }] = usePostDonateInfoMutation();

    const [open, setOpen] = useState(false);
    const theme = useTheme<Theme>();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [data, setData] = useState<DonateInfoRequest>(initData);
    const fileUrl = useMemo<string>(() => {
        return data.qrcode !== null ? URL.createObjectURL(data.qrcode) : "";
    }, [data.qrcode]);

    /* useEffect(() => {
     // test
     console.log(data);
     }, [data]); */

    const handleClick = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleReset = () => {
        setData(initData);
    };

    const onDrop = useCallback(
        (files: File[]) => {
            setData({
                ...data,
                qrcode: files[0],
            });
        },
        [data]
    );

    const handleSubmit = () => {
        // check data
        if (data.name === "" || data.qrcode === null) {
            enqueueSnackbar(t("???????????????????????????", { ns: "api" }), {
                variant: "warning",
            });
            return;
        }
        if (data.comment.length >= 256) {
            enqueueSnackbar(t("??????????????????", { ns: "api" }), {
                variant: "warning",
            });
            return;
        }

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("comment", data.comment);
        formData.append("qrcode", data.qrcode);

        // api post
        postDonateInfo(formData)
            .unwrap()
            .then((r) => {
                console.log(r);
                enqueueSnackbar(t("????????????", { ns: "api" }), {
                    variant: "success",
                });
                handleClose();
                history.push("/donate/" + r);
            })
            .catch((err) => {
                const error = err as AxiosError<ResponseData<DonateInfoResponse>>;
                console.error(error);
                enqueueSnackbar(t(error.response?.data.message || error.message, { ns: "api" }), {
                    variant: "error",
                });
            });
    };

    const {
        getRootProps,
        getInputProps,
        inputRef,
        open: openUploadWindow,
    } = useDropzone({
        onDrop,
        accept: {
            "image/*": accept,
        },
        maxSize: 1048576,
        maxFiles: 1,
        noClick: true,
        multiple: false,
        onError(err) {
            console.error(err);
            enqueueSnackbar(t("????????????", { ns: "api" }), {
                variant: "error",
            });
        },
    });

    return (
        <>
            <ButtonBase className={clsx("uploadButton", classes.buttonBase)} onClick={handleClick}>
                <Paper className={classes.paper}>
                    <UploadRoundedIcon
                        className={classes.icon}
                        sx={{
                            color: blue[600],
                        }}
                    />
                    <Typography variant={"h5"} className={classes.text} component={"span"}>
                        {t("??????")}
                    </Typography>
                </Paper>
            </ButtonBase>
            <Dialog
                open={open}
                onClose={handleClose}
                className={classes.uploadButtonDialog}
                fullWidth={!isMobile}
                fullScreen={isMobile}
                keepMounted
            >
                <DialogTitle>{t("???????????????")}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} component={"form"} className={classes.form}>
                        <TextField
                            variant={"standard"}
                            label={t("??????")}
                            value={data.name}
                            onChange={(e) => {
                                setData({
                                    ...data,
                                    name: e.target.value,
                                });
                            }}
                            autoComplete={"name"}
                            type={"text"}
                            required
                        />
                        <TextField
                            variant={"standard"}
                            label={t("??????")}
                            value={data.comment}
                            onChange={(e) => {
                                setData({
                                    ...data,
                                    comment: e.target.value,
                                });
                            }}
                            multiline
                            rows={isMobile ? 3 : 5}
                            autoComplete={"comment"}
                            type={"text"}
                            error={data.comment.length >= 256}
                            helperText={t("????????????????????????????????????????????????????????????????????????")}
                        />
                        <FormControl sx={{ pt: 1 }}>
                            <FormLabel>{t("???????????????")}</FormLabel>
                            <Box {...getRootProps()} className={classes.uploader}>
                                <input
                                    {...getInputProps()}
                                    className={classes.input}
                                    type={"file"}
                                    accept={accept.join(",")}
                                    ref={inputRef}
                                />
                                <ButtonBase
                                    className={classes.button}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        openUploadWindow();
                                    }}
                                >
                                    <Stack spacing={1} className={classes.infoPart}>
                                        {data.qrcode === null ? (
                                            <>
                                                <UploadFileRoundedIcon />
                                                <Typography
                                                    variant={"subtitle2"}
                                                    component={"span"}
                                                >
                                                    {t("???????????????????????????????????????")}
                                                </Typography>
                                            </>
                                        ) : (
                                            <Box
                                                component={"img"}
                                                src={fileUrl}
                                                height={"100%"}
                                                paddingY={2}
                                            />
                                        )}
                                    </Stack>
                                </ButtonBase>
                            </Box>
                            <FormHelperText sx={{ mx: 0.5 }}>
                                {t("???????????????????????????????????????????????????????????????????????????")}
                            </FormHelperText>
                        </FormControl>
                    </Stack>
                </DialogContent>
                {isMobile ? (
                    <DialogActions className={classes.actions}>
                        <Button onClick={handleReset} type={"reset"}>
                            {t("??????")}
                        </Button>
                        <Box>
                            <Button onClick={handleClose}>{"??????"}</Button>
                            <Button onClick={handleSubmit} type={"submit"}>
                                {t("??????")}
                            </Button>
                        </Box>
                    </DialogActions>
                ) : (
                    <DialogActions>
                        <Button onClick={handleClose}>{t("??????")}</Button>
                        <Button onClick={handleReset} type={"reset"}>
                            {t("??????")}
                        </Button>
                        <LoadingButton onClick={handleSubmit} type={"submit"} loading={isPosting}>
                            {t("??????")}
                        </LoadingButton>
                    </DialogActions>
                )}
            </Dialog>
        </>
    );
};

export default UploadButton;
