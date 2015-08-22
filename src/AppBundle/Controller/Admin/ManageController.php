<?php

namespace AppBundle\Controller\Admin;

use AppBundle\Data\Entity\User;
use AppBundle\Data\Manager;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

class ManageController extends Controller
{
    /**
     * @Route("/manage/user/{id}", name="manage_users_item")
     * @Method("GET")
     */
    public function getAction(Request $request, $id)
    {
        $dataManager = new Manager('User');

        return new JsonResponse($dataManager->retrieve($id));
    }

    /**
     * @Route("/manage/user", name="manage_users_list")
     * @Method("GET")
     */
    public function indexAction(Request $request)
    {
        $dataManager = new Manager('User');

        return new JsonResponse($dataManager->retrieveAll());
    }

    /**
     * @Route("/manage/user/{id}", name="manage_users_update")
     * @Method("PUT")
     */
    public function updateAction(Request $request, $id)
    {
        $dataManager = new Manager('User');

        $user = new User();
        $user->name = $request->get('name');
        $user->email = $request->get('email');
        $user->categories = $request->get('categories');

        $user->setId($id);

        $validator = $this->get('validator');
        $errors = $validator->validate($user);

        if (count($errors) > 0) {
            $errorsString = (string) $errors;

            return new JsonResponse([
                'success' => false,
                'message' => $errorsString
            ]);
        }

        $id = $dataManager->persist($user);

        return new JsonResponse([
            'success' => true,
            'id' => $id
        ]);
    }

    /**
     * @Route("/manage/user/{id}", name="manage_users_delete")
     * @Method("DELETE")
     */
    public function deleteAction(Request $request, $id)
    {
        $dataManager = new Manager('User');

        $dataManager->delete($id);

        return new JsonResponse([
            'success' => true,
            'id' => $id
        ]);
    }
}